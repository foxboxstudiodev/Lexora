from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ENGINE_VERSION = "lexora_word_engine_db_initializer_v1.1"
LEXORA_TARGET_LEVEL_COUNT = 1000
LEXORA_ACTIVE_LANGUAGE_COUNT = 14

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml"
SCHEMA_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "schema" / "master_schema.sql"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"

REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko", "ar"]

SOURCE_LICENSES = [
    {
        "source_id": "kaikki_wiktionary",
        "source_name": "Kaikki machine-readable Wiktionary dictionaries",
        "source_type": "dictionary_jsonl",
        "source_url": "https://kaikki.org/dictionary/",
        "license_name": "Wiktionary-derived open content; verify attribution before release",
        "license_url": "https://kaikki.org/dictionary/rawdata.html",
        "attribution_required": 1,
        "share_alike_required": 1,
        "commercial_use_allowed": 1,
        "notes": "Primary structured dictionary source. Attribution text must be included in Lexora credits before release.",
    },
    {
        "source_id": "wiktionary_dump",
        "source_name": "Wiktionary raw dumps",
        "source_type": "dictionary_dump",
        "source_url": "https://dumps.wikimedia.org/",
        "license_name": "Wikimedia/Wiktionary open content license; attribution required",
        "license_url": "https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use",
        "attribution_required": 1,
        "share_alike_required": 1,
        "commercial_use_allowed": 1,
        "notes": "Fallback/direct source when Kaikki coverage is insufficient.",
    },
    {
        "source_id": "hunspell_dictionary",
        "source_name": "Hunspell/LibreOffice spelling dictionaries",
        "source_type": "spell_dictionary",
        "source_url": "https://github.com/LibreOffice/dictionaries",
        "license_name": "Varies by language dictionary; verify per language",
        "license_url": "https://github.com/LibreOffice/dictionaries",
        "attribution_required": 1,
        "share_alike_required": 0,
        "commercial_use_allowed": 1,
        "notes": "Used for spelling validation and cross-check, not blindly as gameplay approval.",
    },
    {
        "source_id": "open_frequency_corpus",
        "source_name": "Open frequency/corpus sources",
        "source_type": "frequency_corpus",
        "source_url": "",
        "license_name": "Varies by corpus; verify per source",
        "license_url": "",
        "attribution_required": 1,
        "share_alike_required": 0,
        "commercial_use_allowed": 1,
        "notes": "Used to estimate familiarity/commonness and gameplay score.",
    },
    {
        "source_id": "manual_curated",
        "source_name": "Lexora manually curated word list",
        "source_type": "manual",
        "source_url": "",
        "license_name": "Lexora proprietary curated entries",
        "license_url": "",
        "attribution_required": 0,
        "share_alike_required": 0,
        "commercial_use_allowed": 1,
        "notes": "Human-approved additions and corrections.",
    },
    {
        "source_id": "manual_blacklist",
        "source_name": "Lexora manual blacklist",
        "source_type": "manual_blacklist",
        "source_url": "",
        "license_name": "Lexora proprietary moderation data",
        "license_url": "",
        "attribution_required": 0,
        "share_alike_required": 0,
        "commercial_use_allowed": 1,
        "notes": "Words explicitly blocked from gameplay.",
    },
]


@dataclass(slots=True)
class InitReport:
    db_path: str
    reset: bool
    config_path: str
    schema_path: str
    config_hash: str
    schema_hash: str
    languages_inserted: int
    sources_inserted: int
    table_count: int
    view_count: int
    integrity_check: str
    build_id: str


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    return path.read_text(encoding="utf-8-sig")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_yaml(path: Path) -> dict[str, Any]:
    import yaml

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("languages.yaml did not parse into a dictionary")
    return data


def strict_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def get_languages(config: dict[str, Any]) -> dict[str, dict[str, Any]]:
    languages = config.get("languages")
    if not isinstance(languages, dict):
        raise ValueError("languages.yaml missing top-level 'languages' dictionary")

    missing = [code for code in REQUIRED_LANGUAGES if code not in languages]
    extra = [code for code in languages.keys() if code not in REQUIRED_LANGUAGES]

    if missing:
        raise ValueError(f"languages.yaml missing required languages: {missing}")
    if extra:
        raise ValueError(f"languages.yaml contains unexpected languages: {extra}")
    if len(languages) != LEXORA_ACTIVE_LANGUAGE_COUNT:
        raise ValueError(
            f"languages.yaml must contain exactly {LEXORA_ACTIVE_LANGUAGE_COUNT} active languages, got {len(languages)}"
        )

    return languages


def validate_language_config(code: str, lang: dict[str, Any]) -> None:
    required_fields = [
        "english_name",
        "native_name",
        "script",
        "active",
        "target_level_count",
        "min_wheel_letters",
        "supports_accents",
        "case_policy",
        "min_word_length",
        "max_word_length",
        "alphabet",
        "normalize",
        "sources",
        "gameplay",
    ]

    missing = [field for field in required_fields if field not in lang]
    if missing:
        raise ValueError(f"Language {code} missing fields: {missing}")

    if not bool(lang["active"]):
        raise ValueError(f"Language {code} must be active in the final 14-language Lexora contract")

    target_level_count = int(lang.get("target_level_count") or 0)
    if target_level_count != LEXORA_TARGET_LEVEL_COUNT:
        raise ValueError(
            f"Language {code} target_level_count must be exactly {LEXORA_TARGET_LEVEL_COUNT}, got {target_level_count}"
        )

    min_wheel_letters = int(lang["min_wheel_letters"])
    if min_wheel_letters < 4:
        raise ValueError(f"Language {code} min_wheel_letters must be at least 4")

    min_len = int(lang["min_word_length"])
    max_len = int(lang["max_word_length"])
    if min_len <= 0 or max_len < min_len:
        raise ValueError(f"Language {code} has invalid length policy: {min_len}-{max_len}")

    if not isinstance(lang["normalize"], dict):
        raise ValueError(f"Language {code} normalize policy must be a dictionary")
    if not isinstance(lang["sources"], dict):
        raise ValueError(f"Language {code} sources policy must be a dictionary")
    if not isinstance(lang["gameplay"], dict):
        raise ValueError(f"Language {code} gameplay policy must be a dictionary")


def connect_db(db_path: Path, reset: bool) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)

    if reset and db_path.exists():
        db_path.unlink()

    for sidecar in [db_path.with_suffix(db_path.suffix + "-wal"), db_path.with_suffix(db_path.suffix + "-shm")]:
        if reset and sidecar.exists():
            sidecar.unlink()

    con = sqlite3.connect(db_path)
    con.execute("PRAGMA foreign_keys = ON")
    return con


def execute_schema(con: sqlite3.Connection, schema_sql: str) -> None:
    con.executescript(schema_sql)


def insert_languages(con: sqlite3.Connection, config: dict[str, Any]) -> int:
    languages = get_languages(config)
    now = utc_now()
    rows = []

    for code in REQUIRED_LANGUAGES:
        lang = languages[code]
        validate_language_config(code, lang)
        rows.append(
            (
                code,
                str(lang["english_name"]),
                str(lang["native_name"]),
                str(lang["script"]),
                1,
                int(lang["target_level_count"]),
                int(lang["min_wheel_letters"]),
                1 if bool(lang["supports_accents"]) else 0,
                int(lang["min_word_length"]),
                int(lang["max_word_length"]),
                str(lang["alphabet"]),
                str(lang.get("allowed_extra_chars") or ""),
                str(lang["case_policy"]),
                strict_json(lang["normalize"]),
                strict_json(lang["gameplay"]),
                strict_json(lang["sources"]),
                now,
                now,
            )
        )

    con.executemany(
        """
        INSERT INTO languages (
            language_code, english_name, native_name, script, active,
            target_level_count, min_wheel_letters, supports_accents,
            min_word_length, max_word_length, alphabet, allowed_extra_chars,
            case_policy, normalization_policy_json, gameplay_policy_json,
            source_policy_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(language_code) DO UPDATE SET
            english_name=excluded.english_name,
            native_name=excluded.native_name,
            script=excluded.script,
            active=excluded.active,
            target_level_count=excluded.target_level_count,
            min_wheel_letters=excluded.min_wheel_letters,
            supports_accents=excluded.supports_accents,
            min_word_length=excluded.min_word_length,
            max_word_length=excluded.max_word_length,
            alphabet=excluded.alphabet,
            allowed_extra_chars=excluded.allowed_extra_chars,
            case_policy=excluded.case_policy,
            normalization_policy_json=excluded.normalization_policy_json,
            gameplay_policy_json=excluded.gameplay_policy_json,
            source_policy_json=excluded.source_policy_json,
            updated_at=excluded.updated_at
        """,
        rows,
    )
    return len(rows)


def insert_source_licenses(con: sqlite3.Connection) -> int:
    now = utc_now()
    rows = []

    for source in SOURCE_LICENSES:
        rows.append(
            (
                source["source_id"],
                source["source_name"],
                source["source_type"],
                source.get("source_url") or "",
                source.get("license_name") or "",
                source.get("license_url") or "",
                int(source.get("attribution_required", 1)),
                int(source.get("share_alike_required", 0)),
                int(source.get("commercial_use_allowed", 1)),
                source.get("notes") or "",
                now,
                now,
            )
        )

    con.executemany(
        """
        INSERT INTO source_licenses (
            source_id, source_name, source_type, source_url, license_name, license_url,
            attribution_required, share_alike_required, commercial_use_allowed,
            notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source_id) DO UPDATE SET
            source_name=excluded.source_name,
            source_type=excluded.source_type,
            source_url=excluded.source_url,
            license_name=excluded.license_name,
            license_url=excluded.license_url,
            attribution_required=excluded.attribution_required,
            share_alike_required=excluded.share_alike_required,
            commercial_use_allowed=excluded.commercial_use_allowed,
            notes=excluded.notes,
            updated_at=excluded.updated_at
        """,
        rows,
    )
    return len(rows)


def create_build_run(
    con: sqlite3.Connection,
    config_hash: str,
    schema_hash: str,
    status: str,
    summary: dict[str, Any] | None = None,
    error: dict[str, Any] | None = None,
) -> str:
    build_id = f"schema_init_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
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
            "schema_init",
            ",".join(REQUIRED_LANGUAGES),
            now,
            now,
            status,
            config_hash,
            strict_json({"schema_hash": schema_hash, "config_path": str(CONFIG_PATH), "schema_path": str(SCHEMA_PATH)}),
            strict_json(summary or {}),
            strict_json(error or {}),
        ),
    )
    return build_id


def count_objects(con: sqlite3.Connection, object_type: str) -> int:
    value = con.execute("SELECT COUNT(*) FROM sqlite_master WHERE type = ?", (object_type,)).fetchone()[0]
    return int(value or 0)


def run_integrity_check(con: sqlite3.Connection) -> str:
    return str(con.execute("PRAGMA integrity_check").fetchone()[0])


def initialize(db_path: Path, reset: bool) -> InitReport:
    config_text = read_text(CONFIG_PATH)
    schema_text = read_text(SCHEMA_PATH)

    config_hash = sha256_text(config_text)
    schema_hash = sha256_text(schema_text)
    config = load_yaml(CONFIG_PATH)

    con = connect_db(db_path, reset=reset)

    try:
        execute_schema(con, schema_text)
        languages_inserted = insert_languages(con, config)
        sources_inserted = insert_source_licenses(con)

        summary = {
            "languages_inserted": languages_inserted,
            "sources_inserted": sources_inserted,
            "required_languages": REQUIRED_LANGUAGES,
            "target_level_count": LEXORA_TARGET_LEVEL_COUNT,
            "total_runtime_levels": len(REQUIRED_LANGUAGES) * LEXORA_TARGET_LEVEL_COUNT,
        }

        build_id = create_build_run(con, config_hash, schema_hash, "OK", summary=summary)
        integrity = run_integrity_check(con)
        if integrity.lower() != "ok":
            raise RuntimeError(f"SQLite integrity check failed: {integrity}")

        table_count = count_objects(con, "table")
        view_count = count_objects(con, "view")
        con.commit()

        return InitReport(
            db_path=str(db_path),
            reset=reset,
            config_path=str(CONFIG_PATH),
            schema_path=str(SCHEMA_PATH),
            config_hash=config_hash,
            schema_hash=schema_hash,
            languages_inserted=languages_inserted,
            sources_inserted=sources_inserted,
            table_count=table_count,
            view_count=view_count,
            integrity_check=integrity,
            build_id=build_id,
        )

    except Exception as exc:
        con.rollback()
        try:
            execute_schema(con, schema_text)
            create_build_run(con, config_hash, schema_hash, "FAILED", error={"error": str(exc)})
            con.commit()
        except Exception:
            con.rollback()
        raise
    finally:
        con.close()


def print_report(report: InitReport) -> None:
    print()
    print("LEXORA WORD ENGINE MASTER DB INITIALIZER")
    print("=" * 100)
    print("ENGINE:", ENGINE_VERSION)
    print("DB:", report.db_path)
    print("RESET:", report.reset)
    print("CONFIG:", report.config_path)
    print("SCHEMA:", report.schema_path)
    print("CONFIG HASH:", report.config_hash)
    print("SCHEMA HASH:", report.schema_hash)
    print("TARGET LEVELS PER LANGUAGE:", LEXORA_TARGET_LEVEL_COUNT)
    print("TOTAL RUNTIME LEVELS:", len(REQUIRED_LANGUAGES) * LEXORA_TARGET_LEVEL_COUNT)
    print("LANGUAGES INSERTED:", report.languages_inserted)
    print("SOURCES INSERTED:", report.sources_inserted)
    print("TABLES:", report.table_count)
    print("VIEWS:", report.view_count)
    print("INTEGRITY CHECK:", report.integrity_check)
    print("BUILD ID:", report.build_id)

    print()
    print("LANGUAGES")
    print("-" * 100)
    for i, code in enumerate(REQUIRED_LANGUAGES, 1):
        print(f"{i:02d}. {code}")

    print()
    print("LEXORA_WORD_ENGINE_MASTER_DB_INIT_OK")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Initialize Lexora Word Engine master SQLite database.")
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="Output SQLite DB path")
    parser.add_argument("--reset", action="store_true", help="Delete and recreate DB before initialization")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    db_path = Path(args.db)

    try:
        report = initialize(db_path=db_path, reset=bool(args.reset))
        print_report(report)
        return 0
    except Exception as exc:
        print()
        print("LEXORA WORD ENGINE MASTER DB INITIALIZER FAILED")
        print("=" * 100)
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
