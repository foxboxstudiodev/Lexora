from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote

ENGINE_VERSION = "lexora_raw_source_registry_auditor_v1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"
RAW_ROOT = PROJECT_ROOT / "data" / "lexora_word_engine" / "raw" / "kaikki"

REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko", "ar"]
KAIKKI_BASE_URL = "https://kaikki.org/dictionary/{slug}/kaikki.org-dictionary-{slug}.jsonl"


@dataclass(slots=True)
class RawAuditResult:
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

    data = yaml.safe_load(path.read_text(encoding="utf-8"))

    if not isinstance(data, dict):
        raise ValueError("languages.yaml did not parse into dictionary")

    return data


def connect_db(path: Path) -> sqlite3.Connection:
    if not path.exists():
        raise FileNotFoundError(f"Master DB not found: {path}")

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


def kaikki_url(slug: str) -> str:
    return KAIKKI_BASE_URL.format(slug=quote(slug, safe=""))


def raw_path_for(language_code: str, slug: str) -> Path:
    safe_slug = slug.replace("/", "_").replace("\\", "_").replace(" ", "_")
    return RAW_ROOT / language_code / f"kaikki_{language_code}_{safe_slug}.jsonl"


def get_slug(config: dict[str, Any], language_code: str) -> str:
    lang = config["languages"][language_code]
    slug = str(lang["sources"]["kaikki_wiktionary"]["dictionary_slug"]).strip()
    if not slug:
        raise ValueError(f"Missing dictionary_slug for {language_code}")
    return slug


def create_build_run(con: sqlite3.Connection) -> str:
    build_id = f"raw_registry_resync_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
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
            "raw_source_registry_resync",
            ",".join(REQUIRED_LANGUAGES),
            now,
            None,
            "RUNNING",
            "",
            json.dumps({"source_id": "kaikki_wiktionary", "raw_root": str(RAW_ROOT)}, ensure_ascii=False),
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


def scan_file_once(path: Path, language_code: str) -> tuple[int, int, str]:
    total = path.stat().st_size
    done = 0
    line_count = 0
    h = hashlib.sha256()
    last_print = time.time()

    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break

            h.update(chunk)
            line_count += chunk.count(b"\n")
            done += len(chunk)

            now = time.time()
            if now - last_print >= 3:
                pct = done / total * 100 if total else 0
                print(
                    f"  {language_code}: {done / 1024 / 1024:.2f} MB / {total / 1024 / 1024:.2f} MB ({pct:.1f}%)",
                    flush=True,
                )
                last_print = now

    return total, line_count, h.hexdigest()


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
        raise RuntimeError("No valid JSONL sample lines found")


def insert_result(con: sqlite3.Connection, build_id: str, result: RawAuditResult) -> None:
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


def audit_language(config: dict[str, Any], language_code: str) -> RawAuditResult:
    started = time.time()
    slug = get_slug(config, language_code)
    path = raw_path_for(language_code, slug)
    url = kaikki_url(slug)

    try:
        if not path.exists():
            raise FileNotFoundError(f"Raw file not found: {path}")

        if path.stat().st_size <= 0:
            raise RuntimeError(f"Raw file is empty: {path}")

        print()
        print(f"AUDIT {language_code} | {slug}")
        print("-" * 100)
        print("PATH:", path)

        validate_jsonl_sample(path)
        bytes_count, line_count, digest = scan_file_once(path, language_code)

        if line_count <= 0:
            raise RuntimeError("Line count is zero")

        return RawAuditResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(path),
            status="OK",
            bytes_count=bytes_count,
            line_count=line_count,
            sha256=digest,
            elapsed_seconds=round(time.time() - started, 3),
            error="",
        )

    except Exception as exc:
        return RawAuditResult(
            language_code=language_code,
            dictionary_slug=slug,
            source_url=url,
            local_path=str(path),
            status="FAILED",
            bytes_count=0,
            line_count=0,
            sha256="",
            elapsed_seconds=round(time.time() - started, 3),
            error=str(exc),
        )


def print_report(results: list[RawAuditResult], build_id: str) -> None:
    ok = [r for r in results if r.status == "OK"]
    failed = [r for r in results if r.status != "OK"]

    print()
    print("LEXORA RAW SOURCE REGISTRY AUDITOR")
    print("=" * 100)
    print("ENGINE:", ENGINE_VERSION)
    print("BUILD ID:", build_id)
    print("RESULTS:", len(results))
    print("OK:", len(ok))
    print("FAILED:", len(failed))
    print("TOTAL MB:", round(sum(r.bytes_count for r in ok) / 1024 / 1024, 2))
    print("TOTAL LINES:", sum(r.line_count for r in ok))

    print()
    print("RAW FILE REGISTRY")
    print("-" * 100)

    for i, r in enumerate(results, 1):
        print(
            f"{i:02d}. {r.language_code:<2} | {r.dictionary_slug:<12} | {r.status:<6} | "
            f"MB={r.bytes_count / 1024 / 1024:8.2f} | lines={r.line_count:<9} | "
            f"sha256={r.sha256[:16] if r.sha256 else '-'} | sec={r.elapsed_seconds}"
        )
        if r.error:
            print("    ERROR:", r.error)

    print()
    if failed:
        print("LEXORA_RAW_SOURCE_REGISTRY_AUDITOR_FAILED_OR_PARTIAL")
    else:
        print("LEXORA_RAW_SOURCE_REGISTRY_AUDITOR_OK")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Audit local Kaikki raw files and register them in master DB.")
    p.add_argument("--db", default=str(DEFAULT_DB_PATH))
    return p.parse_args()


def main() -> int:
    args = parse_args()
    config = load_yaml(CONFIG_PATH)

    con = connect_db(Path(args.db))
    ensure_registry_tables(con)

    build_id = create_build_run(con)
    con.commit()

    results: list[RawAuditResult] = []

    try:
        for code in REQUIRED_LANGUAGES:
            result = audit_language(config, code)
            results.append(result)
            insert_result(con, build_id, result)
            con.commit()

        summary = {
            "total": len(results),
            "ok": sum(1 for r in results if r.status == "OK"),
            "failed": sum(1 for r in results if r.status != "OK"),
            "total_bytes": sum(r.bytes_count for r in results if r.status == "OK"),
            "total_lines": sum(r.line_count for r in results if r.status == "OK"),
        }

        status = "OK" if summary["failed"] == 0 else "PARTIAL_FAILED"
        finish_build_run(con, build_id, status, summary)
        con.commit()

        print_report(results, build_id)
        return 0 if status == "OK" else 1

    except Exception as exc:
        con.rollback()
        finish_build_run(con, build_id, "FAILED", {"completed": len(results)}, error=str(exc))
        con.commit()

        print()
        print("LEXORA RAW SOURCE REGISTRY AUDITOR FAILED")
        print("=" * 100)
        print(str(exc))
        return 1

    finally:
        con.close()


if __name__ == "__main__":
    raise SystemExit(main())
