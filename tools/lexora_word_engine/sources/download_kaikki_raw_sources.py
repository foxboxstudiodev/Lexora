from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import time
import urllib.request
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote

ENGINE_VERSION = "lexora_kaikki_raw_downloader_v1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[3]
CONFIG_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"
RAW_ROOT = PROJECT_ROOT / "data" / "lexora_word_engine" / "raw" / "kaikki"

REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko"]

KAIKKI_BASE_URL = "https://kaikki.org/dictionary/{slug}/kaikki.org-dictionary-{slug}.jsonl"


@dataclass(slots=True)
class DownloadResult:
    language_code: str
    dictionary_slug: str
    source_url: str
    local_path: str
    status: str
    bytes_count: int
    line_count: int
    sha256: str
    error: str


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def load_yaml(path: Path) -> dict[str, Any]:
    import yaml

    if not path.exists():
        raise FileNotFoundError(f"Required config not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("languages.yaml did not parse into dictionary")

    return data


def ensure_db_exists(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(
            f"Master DB not found: {path}\n"
            f"Run first: python tools/lexora_word_engine/init_master_db.py --reset"
        )


def connect_db(path: Path) -> sqlite3.Connection:
    ensure_db_exists(path)
    con = sqlite3.connect(path)
    con.execute("PRAGMA foreign_keys = ON")
    return con


def ensure_registry_tables(con: sqlite3.Connection) -> None:
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS raw_source_files (
            raw_file_id INTEGER PRIMARY KEY AUTOINCREMENT,
            build_id TEXT NOT NULL,
            language_code TEXT NOT NULL,
            source_id TEXT NOT NULL,
            dictionary_slug TEXT NOT NULL,
            source_url TEXT NOT NULL,
            local_path TEXT NOT NULL,
            status TEXT NOT NULL,
            bytes_count INTEGER NOT NULL DEFAULT 0,
            line_count INTEGER NOT NULL DEFAULT 0,
            sha256 TEXT,
            error TEXT,
            downloaded_at TEXT NOT NULL,
            FOREIGN KEY(language_code) REFERENCES languages(language_code),
            FOREIGN KEY(source_id) REFERENCES source_licenses(source_id)
        )
        """
    )

    con.execute("CREATE INDEX IF NOT EXISTS idx_raw_source_files_lang ON raw_source_files(language_code, source_id)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_raw_source_files_status ON raw_source_files(status)")


def get_language_configs(config: dict[str, Any], selected: list[str]) -> dict[str, dict[str, Any]]:
    languages = config.get("languages")
    if not isinstance(languages, dict):
        raise ValueError("languages.yaml missing languages dictionary")

    missing = [code for code in selected if code not in languages]
    if missing:
        raise ValueError(f"Selected languages not found in languages.yaml: {missing}")

    out: dict[str, dict[str, Any]] = {}
    for code in selected:
        lang = languages[code]
        sources = lang.get("sources") or {}
        kaikki = sources.get("kaikki_wiktionary") or {}

        if not bool(kaikki.get("enabled", False)):
            raise ValueError(f"Kaikki source is disabled for language: {code}")

        slug = str(kaikki.get("dictionary_slug") or "").strip()
        if not slug:
            raise ValueError(f"Missing Kaikki dictionary_slug for language: {code}")

        out[code] = lang

    return out


def parse_languages(value: str | None) -> list[str]:
    if not value or value.strip().lower() in {"all", "*"}:
        return REQUIRED_LANGUAGES

    out = []
    for part in value.split(","):
        code = part.strip()
        if not code:
            continue
        out.append(code)

    bad = [x for x in out if x not in REQUIRED_LANGUAGES]
    if bad:
        raise ValueError(f"Unsupported language code(s): {bad}. Allowed: {REQUIRED_LANGUAGES}")

    return out


def kaikki_url(slug: str) -> str:
    encoded = quote(slug, safe="")
    return KAIKKI_BASE_URL.format(slug=encoded)


def raw_path_for(language_code: str, slug: str) -> Path:
    safe_slug = slug.replace("/", "_").replace("\\", "_").replace(" ", "_")
    return RAW_ROOT / language_code / f"kaikki_{language_code}_{safe_slug}.jsonl"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def count_lines(path: Path) -> int:
    count = 0
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            count += chunk.count(b"\n")
    return count


def download_url(url: str, target_path: Path, force: bool, timeout: int) -> tuple[int, str]:
    target_path.parent.mkdir(parents=True, exist_ok=True)

    if target_path.exists() and target_path.stat().st_size > 0 and not force:
        return int(target_path.stat().st_size), "EXISTS"

    tmp = target_path.with_suffix(target_path.suffix + ".tmp")

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "LexoraWordEngine/1.0 professional word-base builder"
        },
    )

    downloaded = 0

    with urllib.request.urlopen(req, timeout=timeout) as response:
        status = getattr(response, "status", 200)
        if int(status) != 200:
            raise RuntimeError(f"HTTP status {status}")

        with tmp.open("wb") as f:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)

    if downloaded <= 0:
        raise RuntimeError("Downloaded file is empty")

    tmp.replace(target_path)
    return downloaded, "DOWNLOADED"


def create_build_run(con: sqlite3.Connection, selected_languages: list[str], dry_run: bool) -> str:
    build_id = f"raw_download_kaikki_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
    now = utc_now()

    con.execute(
        """
        INSERT INTO build_runs (
            build_id, engine_version, build_mode, language_filter, started_at,
            finished_at, status, config_hash, source_snapshot_json, summary_json, error_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            build_id,
            ENGINE_VERSION,
            "kaikki_raw_download",
            ",".join(selected_languages),
            now,
            None,
            "RUNNING",
            "",
            json.dumps({"source_id": "kaikki_wiktionary"}, ensure_ascii=False),
            json.dumps({"dry_run": dry_run}, ensure_ascii=False),
            "{}",
        ),
    )

    return build_id


def finish_build_run(con: sqlite3.Connection, build_id: str, status: str, summary: dict[str, Any], error: dict[str, Any] | None = None) -> None:
    con.execute(
        """
        UPDATE build_runs
        SET finished_at = ?,
            status = ?,
            summary_json = ?,
            error_json = ?
        WHERE build_id = ?
        """,
        (
            utc_now(),
            status,
            json.dumps(summary, ensure_ascii=False, sort_keys=True),
            json.dumps(error or {}, ensure_ascii=False, sort_keys=True),
            build_id,
        ),
    )


def insert_raw_file_result(con: sqlite3.Connection, build_id: str, result: DownloadResult) -> None:
    con.execute(
        """
        INSERT INTO raw_source_files (
            build_id, language_code, source_id, dictionary_slug, source_url,
            local_path, status, bytes_count, line_count, sha256, error, downloaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            build_id,
            result.language_code,
            "kaikki_wiktionary",
            result.dictionary_slug,
            result.source_url,
            result.local_path,
            result.status,
            result.bytes_count,
            result.line_count,
            result.sha256,
            result.error,
            utc_now(),
        ),
    )


def download_language(language_code: str, lang_config: dict[str, Any], force: bool, timeout: int, dry_run: bool) -> DownloadResult:
    slug = str(lang_config["sources"]["kaikki_wiktionary"]["dictionary_slug"]).strip()
    url = kaikki_url(slug)
    path = raw_path_for(language_code, slug)

    if dry_run:
        return DownloadResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(path),
            status="DRY_RUN",
            bytes_count=0,
            line_count=0,
            sha256="",
            error="",
        )

    try:
        _, download_status = download_url(url, path, force=force, timeout=timeout)

        bytes_count = int(path.stat().st_size)
        line_count = count_lines(path)
        digest = sha256_file(path)

        if line_count <= 0:
            raise RuntimeError("Downloaded JSONL has zero lines")

        return DownloadResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(path),
            status=download_status,
            bytes_count=bytes_count,
            line_count=line_count,
            sha256=digest,
            error="",
        )

    except Exception as exc:
        return DownloadResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(path),
            status="FAILED",
            bytes_count=0,
            line_count=0,
            sha256="",
            error=str(exc),
        )


def print_report(results: list[DownloadResult], build_id: str, dry_run: bool) -> None:
    print()
    print("LEXORA KAIKKI RAW SOURCE DOWNLOADER")
    print("=" * 100)
    print("ENGINE:", ENGINE_VERSION)
    print("BUILD ID:", build_id)
    print("DRY RUN:", dry_run)
    print("RESULTS:", len(results))

    ok = [r for r in results if r.status in {"DOWNLOADED", "EXISTS", "DRY_RUN"}]
    failed = [r for r in results if r.status == "FAILED"]

    print("OK:", len(ok))
    print("FAILED:", len(failed))

    print()
    print("RAW SOURCE RESULTS")
    print("-" * 100)

    for i, r in enumerate(results, 1):
        mb = r.bytes_count / 1024 / 1024 if r.bytes_count else 0
        print(
            f"{i:02d}. {r.language_code:<2} | {r.dictionary_slug:<14} | "
            f"{r.status:<10} | size={mb:8.2f} MB | lines={r.line_count:<8} | "
            f"path={r.local_path}"
        )
        if r.error:
            print(f"    ERROR: {r.error}")

    print()

    if failed:
        print("LEXORA_KAIKKI_RAW_DOWNLOADER_FAILED_OR_PARTIAL")
    else:
        print("LEXORA_KAIKKI_RAW_DOWNLOADER_OK")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Download Kaikki/Wiktionary raw JSONL sources for Lexora languages.")
    p.add_argument("--languages", default="all", help="Comma-separated language codes or all")
    p.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Master SQLite DB path")
    p.add_argument("--force", action="store_true", help="Redownload even if file exists")
    p.add_argument("--dry-run", action="store_true", help="Show URLs/paths without downloading")
    p.add_argument("--timeout", type=int, default=180)
    p.add_argument("--sleep", type=float, default=0.5)
    return p.parse_args()


def main() -> int:
    args = parse_args()

    selected_languages = parse_languages(args.languages)
    config = load_yaml(CONFIG_PATH)
    language_configs = get_language_configs(config, selected_languages)

    con = connect_db(Path(args.db))
    ensure_registry_tables(con)

    build_id = create_build_run(con, selected_languages, dry_run=bool(args.dry_run))
    con.commit()

    results: list[DownloadResult] = []

    try:
        for idx, code in enumerate(selected_languages, 1):
            print(f"DOWNLOAD {idx}/{len(selected_languages)} | {code}")
            result = download_language(
                language_code=code,
                lang_config=language_configs[code],
                force=bool(args.force),
                timeout=int(args.timeout),
                dry_run=bool(args.dry_run),
            )
            results.append(result)
            insert_raw_file_result(con, build_id, result)
            con.commit()

            if float(args.sleep) > 0:
                time.sleep(float(args.sleep))

        summary = {
            "total": len(results),
            "ok": sum(1 for r in results if r.status in {"DOWNLOADED", "EXISTS", "DRY_RUN"}),
            "failed": sum(1 for r in results if r.status == "FAILED"),
            "languages": selected_languages,
            "total_bytes": sum(r.bytes_count for r in results),
            "total_lines": sum(r.line_count for r in results),
        }

        final_status = "OK" if summary["failed"] == 0 else "PARTIAL_FAILED"
        finish_build_run(con, build_id, final_status, summary)
        con.commit()

        print_report(results, build_id, dry_run=bool(args.dry_run))
        return 0 if summary["failed"] == 0 else 1

    except Exception as exc:
        con.rollback()
        finish_build_run(
            con,
            build_id,
            "FAILED",
            {"completed_results": len(results)},
            error={"error": str(exc)},
        )
        con.commit()

        print()
        print("LEXORA KAIKKI RAW SOURCE DOWNLOADER FAILED")
        print("=" * 100)
        print(str(exc))
        return 1

    finally:
        con.close()


if __name__ == "__main__":
    raise SystemExit(main())
