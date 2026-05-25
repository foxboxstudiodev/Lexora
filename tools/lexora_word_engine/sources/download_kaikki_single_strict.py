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

ENGINE_VERSION = "lexora_kaikki_single_strict_downloader_v1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[3]
CONFIG_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"
RAW_ROOT = PROJECT_ROOT / "data" / "lexora_word_engine" / "raw" / "kaikki"

REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko", "ar"]
KAIKKI_BASE_URL = "https://kaikki.org/dictionary/{slug}/kaikki.org-dictionary-{slug}.jsonl"


@dataclass(slots=True)
class StrictDownloadResult:
    language_code: str
    dictionary_slug: str
    source_url: str
    local_path: str
    status: str
    bytes_count: int
    line_count: int
    sha256: str
    elapsed_seconds: float
    error: str


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def load_yaml(path: Path) -> dict[str, Any]:
    import yaml

    if not path.exists():
        raise FileNotFoundError(f"Config not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("languages.yaml did not parse into dictionary")

    return data


def connect_db(path: Path) -> sqlite3.Connection:
    if not path.exists():
        raise FileNotFoundError(
            f"Master DB not found: {path}. Run: python tools/lexora_word_engine/init_master_db.py --reset"
        )

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


def get_language_config(config: dict[str, Any], language_code: str) -> dict[str, Any]:
    if language_code not in REQUIRED_LANGUAGES:
        raise ValueError(f"Unsupported language: {language_code}. Allowed: {REQUIRED_LANGUAGES}")

    languages = config.get("languages")
    if not isinstance(languages, dict):
        raise ValueError("languages.yaml missing languages dictionary")

    if language_code not in languages:
        raise ValueError(f"Language not found in languages.yaml: {language_code}")

    lang = languages[language_code]
    sources = lang.get("sources") or {}
    kaikki = sources.get("kaikki_wiktionary") or {}

    if not bool(kaikki.get("enabled", False)):
        raise ValueError(f"Kaikki source disabled for: {language_code}")

    slug = str(kaikki.get("dictionary_slug") or "").strip()
    if not slug:
        raise ValueError(f"Missing dictionary_slug for: {language_code}")

    return lang


def kaikki_url(slug: str) -> str:
    encoded = quote(slug, safe="")
    return KAIKKI_BASE_URL.format(slug=encoded)


def raw_path_for(language_code: str, slug: str) -> Path:
    safe_slug = slug.replace("/", "_").replace("\\", "_").replace(" ", "_")
    return RAW_ROOT / language_code / f"kaikki_{language_code}_{safe_slug}.jsonl"


def head_content_length(url: str, timeout: int) -> int | None:
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "LexoraWordEngine/1.0 strict downloader"},
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.headers.get("Content-Length")
            return int(raw) if raw else None
    except Exception:
        return None


def sha256_file(path: Path) -> str:
    total = path.stat().st_size
    done = 0
    h = hashlib.sha256()
    last_print = time.time()

    print("HASHING SHA256...", flush=True)

    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break

            h.update(chunk)
            done += len(chunk)

            now = time.time()
            if now - last_print >= 2:
                pct = done / total * 100 if total else 0
                print(
                    f"  hash: {done / 1024 / 1024:.2f} MB / {total / 1024 / 1024:.2f} MB ({pct:.1f}%)",
                    flush=True,
                )
                last_print = now

    return h.hexdigest()


def count_lines(path: Path) -> int:
    total = path.stat().st_size
    done = 0
    count = 0
    last_print = time.time()

    print("COUNTING JSONL LINES...", flush=True)

    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break

            count += chunk.count(b"\n")
            done += len(chunk)

            now = time.time()
            if now - last_print >= 2:
                pct = done / total * 100 if total else 0
                print(
                    f"  lines: {done / 1024 / 1024:.2f} MB / {total / 1024 / 1024:.2f} MB ({pct:.1f}%)",
                    flush=True,
                )
                last_print = now

    return count


def validate_jsonl_sample(path: Path) -> None:
    checked = 0

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            json.loads(line)
            checked += 1

            if checked >= 5:
                break

    if checked == 0:
        raise RuntimeError("JSONL validation failed: no non-empty JSON lines found")


def download_with_progress(url: str, final_path: Path, timeout: int, force: bool, retries: int) -> str:
    final_path.parent.mkdir(parents=True, exist_ok=True)

    part_path = final_path.with_suffix(final_path.suffix + ".part")
    tmp_path = final_path.with_suffix(final_path.suffix + ".tmp")

    if tmp_path.exists():
        tmp_path.unlink()

    if final_path.exists() and final_path.stat().st_size > 0 and not force:
        print("FILE EXISTS:", final_path, flush=True)
        return "EXISTS"

    if force:
        if final_path.exists():
            final_path.unlink()
        if part_path.exists():
            part_path.unlink()

    expected_total = head_content_length(url, timeout=timeout)

    if expected_total:
        print(f"REMOTE SIZE: {expected_total / 1024 / 1024:.2f} MB", flush=True)
    else:
        print("REMOTE SIZE: unknown", flush=True)

    for attempt in range(1, retries + 1):
        existing = part_path.stat().st_size if part_path.exists() else 0

        headers = {"User-Agent": "LexoraWordEngine/1.0 strict downloader"}
        if existing > 0:
            headers["Range"] = f"bytes={existing}-"

        print()
        print(f"DOWNLOAD ATTEMPT {attempt}/{retries}", flush=True)
        print("URL:", url, flush=True)
        print("TARGET:", final_path, flush=True)
        print(f"RESUME FROM: {existing / 1024 / 1024:.2f} MB", flush=True)

        req = urllib.request.Request(url, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                status = int(getattr(response, "status", 200))

                if existing > 0 and status == 200:
                    print("SERVER IGNORED RANGE. Restarting clean download.", flush=True)
                    part_path.unlink(missing_ok=True)
                    existing = 0

                if status not in {200, 206}:
                    raise RuntimeError(f"HTTP status {status}")

                mode = "ab" if existing > 0 and status == 206 else "wb"
                downloaded = existing if mode == "ab" else 0

                last_print = time.time()

                with part_path.open(mode) as f:
                    while True:
                        chunk = response.read(1024 * 1024)
                        if not chunk:
                            break

                        f.write(chunk)
                        downloaded += len(chunk)

                        now = time.time()
                        if now - last_print >= 1:
                            if expected_total:
                                pct = downloaded / expected_total * 100
                                print(
                                    f"  downloaded: {downloaded / 1024 / 1024:.2f} MB / "
                                    f"{expected_total / 1024 / 1024:.2f} MB ({pct:.1f}%)",
                                    flush=True,
                                )
                            else:
                                print(f"  downloaded: {downloaded / 1024 / 1024:.2f} MB", flush=True)

                            last_print = now

                size = part_path.stat().st_size

                if expected_total and size < expected_total:
                    print(f"PARTIAL FILE: {size} / {expected_total}. Retrying with resume.", flush=True)
                    time.sleep(3)
                    continue

                if size <= 0:
                    raise RuntimeError("Downloaded file is empty")

                part_path.replace(final_path)
                print("DOWNLOAD COMPLETE:", final_path, flush=True)
                return "DOWNLOADED"

        except KeyboardInterrupt:
            raise
        except Exception as exc:
            print("DOWNLOAD ERROR:", exc, flush=True)

            if attempt >= retries:
                raise

            print("Retrying in 5 seconds...", flush=True)
            time.sleep(5)

    raise RuntimeError("Download failed after all retries")


def create_build_run(con: sqlite3.Connection, language_code: str) -> str:
    build_id = f"strict_kaikki_{language_code}_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
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
            "kaikki_single_language_strict_download",
            language_code,
            now,
            None,
            "RUNNING",
            "",
            json.dumps({"source_id": "kaikki_wiktionary"}, ensure_ascii=False),
            "{}",
            "{}",
        ),
    )

    return build_id


def finish_build_run(con: sqlite3.Connection, build_id: str, status: str, summary: dict[str, Any], error: str = "") -> None:
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
            json.dumps({"error": error}, ensure_ascii=False, sort_keys=True) if error else "{}",
            build_id,
        ),
    )


def insert_raw_file_result(con: sqlite3.Connection, build_id: str, result: StrictDownloadResult) -> None:
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


def strict_download(language_code: str, db_path: Path, timeout: int, retries: int, force: bool, skip_hash: bool) -> StrictDownloadResult:
    started = time.time()

    config = load_yaml(CONFIG_PATH)
    lang = get_language_config(config, language_code)

    slug = str(lang["sources"]["kaikki_wiktionary"]["dictionary_slug"]).strip()
    url = kaikki_url(slug)
    final_path = raw_path_for(language_code, slug)

    con = connect_db(db_path)
    ensure_registry_tables(con)

    build_id = create_build_run(con, language_code)
    con.commit()

    try:
        status = download_with_progress(
            url=url,
            final_path=final_path,
            timeout=timeout,
            force=force,
            retries=retries,
        )

        bytes_count = int(final_path.stat().st_size)
        line_count = count_lines(final_path)

        if line_count <= 0:
            raise RuntimeError("Downloaded JSONL has zero lines")

        validate_jsonl_sample(final_path)

        digest = "" if skip_hash else sha256_file(final_path)

        result = StrictDownloadResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(final_path),
            status=status,
            bytes_count=bytes_count,
            line_count=line_count,
            sha256=digest,
            elapsed_seconds=round(time.time() - started, 3),
            error="",
        )

        insert_raw_file_result(con, build_id, result)
        finish_build_run(
            con,
            build_id,
            "OK",
            {
                "language_code": language_code,
                "status": status,
                "bytes_count": bytes_count,
                "line_count": line_count,
                "sha256": digest,
                "elapsed_seconds": result.elapsed_seconds,
            },
        )
        con.commit()
        return result

    except Exception as exc:
        result = StrictDownloadResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(final_path),
            status="FAILED",
            bytes_count=0,
            line_count=0,
            sha256="",
            elapsed_seconds=round(time.time() - started, 3),
            error=str(exc),
        )

        insert_raw_file_result(con, build_id, result)
        finish_build_run(con, build_id, "FAILED", {"language_code": language_code}, error=str(exc))
        con.commit()
        return result

    finally:
        con.close()


def print_result(result: StrictDownloadResult) -> None:
    print()
    print("LEXORA STRICT SINGLE-LANGUAGE KAIKKI DOWNLOADER")
    print("=" * 100)
    print("ENGINE:", ENGINE_VERSION)
    print("LANGUAGE:", result.language_code)
    print("DICTIONARY:", result.dictionary_slug)
    print("STATUS:", result.status)
    print("SIZE MB:", round(result.bytes_count / 1024 / 1024, 2))
    print("LINES:", result.line_count)
    print("SHA256:", result.sha256 or "-")
    print("SECONDS:", result.elapsed_seconds)
    print("PATH:", result.local_path)

    if result.error:
        print("ERROR:", result.error)
        print("LEXORA_STRICT_KAIKKI_SINGLE_DOWNLOAD_FAILED")
    else:
        print("LEXORA_STRICT_KAIKKI_SINGLE_DOWNLOAD_OK")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Strict one-language Kaikki downloader with progress, resume, retry and validation."
    )
    p.add_argument("--language", required=True, choices=REQUIRED_LANGUAGES)
    p.add_argument("--db", default=str(DEFAULT_DB_PATH))
    p.add_argument("--timeout", type=int, default=120)
    p.add_argument("--retries", type=int, default=5)
    p.add_argument("--force", action="store_true")
    p.add_argument("--skip-hash", action="store_true")
    return p.parse_args()


def main() -> int:
    args = parse_args()

    result = strict_download(
        language_code=str(args.language),
        db_path=Path(args.db),
        timeout=int(args.timeout),
        retries=int(args.retries),
        force=bool(args.force),
        skip_hash=bool(args.skip_hash),
    )

    print_result(result)

    return 0 if result.status in {"DOWNLOADED", "EXISTS"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
