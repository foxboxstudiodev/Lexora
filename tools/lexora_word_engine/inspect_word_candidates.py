from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path
from typing import Any

ENGINE_VERSION = "lexora_word_candidate_inspector_v1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"


def connect_db(path: Path) -> sqlite3.Connection:
    if not path.exists():
        raise FileNotFoundError(f"Master DB not found: {path}")

    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def table_exists(con: sqlite3.Connection, table_name: str) -> bool:
    row = con.execute(
        "SELECT 1 FROM sqlite_master WHERE type IN ('table', 'view') AND name = ? LIMIT 1",
        (table_name,),
    ).fetchone()
    return row is not None


def require_schema(con: sqlite3.Connection) -> None:
    required = [
        "languages",
        "word_entries",
        "word_game_scores",
        "review_queue",
        "rejected_words",
        "build_runs",
    ]

    missing = [name for name in required if not table_exists(con, name)]

    if missing:
        raise RuntimeError("Missing required DB objects: " + ", ".join(missing))


def scalar(con: sqlite3.Connection, sql: str, params: tuple[Any, ...] = ()) -> int:
    row = con.execute(sql, params).fetchone()
    if row is None:
        return 0

    value = row[0]
    return int(value or 0)


def fetch_languages(con: sqlite3.Connection, requested_language: str | None) -> list[str]:
    if requested_language:
        exists = con.execute(
            "SELECT 1 FROM languages WHERE language_code = ? LIMIT 1",
            (requested_language,),
        ).fetchone()

        if not exists:
            raise ValueError(f"Language not found in DB languages table: {requested_language}")

        return [requested_language]

    rows = con.execute(
        """
        SELECT language_code
        FROM languages
        WHERE active = 1
        ORDER BY language_code
        """
    ).fetchall()

    return [str(row["language_code"]) for row in rows]


def print_title(title: str) -> None:
    print()
    print(title)
    print("=" * 100)


def print_section(title: str) -> None:
    print()
    print(title)
    print("-" * 100)


def print_kv(label: str, value: Any) -> None:
    print(f"{label:<34} {value}")


def rows_as_table(rows: list[sqlite3.Row], columns: list[str]) -> None:
    if not rows:
        print("No rows.")
        return

    widths: dict[str, int] = {}

    for col in columns:
        widths[col] = max(
            len(col),
            *(len(str(row[col] if row[col] is not None else "")) for row in rows),
        )

    header = " | ".join(col.ljust(widths[col]) for col in columns)
    print(header)
    print("-" * len(header))

    for row in rows:
        print(
            " | ".join(
                str(row[col] if row[col] is not None else "").ljust(widths[col])
                for col in columns
            )
        )


def inspect_all_summary(con: sqlite3.Connection) -> None:
    print_section("ALL LANGUAGES SUMMARY")

    rows = con.execute(
        """
        SELECT
            l.language_code,
            l.english_name,
            l.native_name,
            COUNT(w.word_id) AS total_words,
            SUM(CASE WHEN w.gameplay_approved = 1 THEN 1 ELSE 0 END) AS gameplay_approved,
            SUM(CASE WHEN w.review_status = 'pending' THEN 1 ELSE 0 END) AS pending_review,
            (
                SELECT COUNT(*)
                FROM rejected_words r
                WHERE r.language_code = l.language_code
            ) AS rejected
        FROM languages l
        LEFT JOIN word_entries w ON w.language_code = l.language_code
        WHERE l.active = 1
        GROUP BY l.language_code, l.english_name, l.native_name
        ORDER BY total_words DESC, l.language_code ASC
        """
    ).fetchall()

    rows_as_table(
        rows,
        [
            "language_code",
            "english_name",
            "native_name",
            "total_words",
            "gameplay_approved",
            "pending_review",
            "rejected",
        ],
    )


def inspect_language(con: sqlite3.Connection, language_code: str, limit: int, show_samples: bool) -> None:
    lang = con.execute(
        """
        SELECT
            language_code,
            english_name,
            native_name,
            script,
            min_word_length,
            max_word_length
        FROM languages
        WHERE language_code = ?
        """,
        (language_code,),
    ).fetchone()

    if lang is None:
        print_section(f"LANGUAGE {language_code}")
        print("Language not found.")
        return

    print_section(f"LANGUAGE: {language_code} | {lang['english_name']} | {lang['native_name']}")

    total_words = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ?",
        (language_code,),
    )

    active_words = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND is_active = 1",
        (language_code,),
    )

    gameplay_approved = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND gameplay_approved = 1",
        (language_code,),
    )

    approved_status = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND review_status = 'approved'",
        (language_code,),
    )

    pending_status = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND review_status = 'pending'",
        (language_code,),
    )

    game_ready_view = 0
    if table_exists(con, "vw_game_approved_words"):
        game_ready_view = scalar(
            con,
            "SELECT COUNT(*) FROM vw_game_approved_words WHERE language_code = ?",
            (language_code,),
        )

    review_queue_pending = scalar(
        con,
        "SELECT COUNT(*) FROM review_queue WHERE language_code = ? AND status = 'pending'",
        (language_code,),
    )

    rejected_total = scalar(
        con,
        "SELECT COUNT(*) FROM rejected_words WHERE language_code = ?",
        (language_code,),
    )

    foreign_count = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND is_foreign = 1",
        (language_code,),
    )

    archaic_count = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND is_archaic = 1",
        (language_code,),
    )

    rare_count = scalar(
        con,
        "SELECT COUNT(*) FROM word_entries WHERE language_code = ? AND is_rare = 1",
        (language_code,),
    )

    print_kv("Script", lang["script"])
    print_kv("Length policy", f"{lang['min_word_length']}..{lang['max_word_length']}")
    print_kv("Total word_entries", f"{total_words:,}")
    print_kv("Active words", f"{active_words:,}")
    print_kv("Gameplay approved flag", f"{gameplay_approved:,}")
    print_kv("Approved review_status", f"{approved_status:,}")
    print_kv("Game-ready view count", f"{game_ready_view:,}")
    print_kv("Pending review_status", f"{pending_status:,}")
    print_kv("Review queue pending", f"{review_queue_pending:,}")
    print_kv("Rejected words", f"{rejected_total:,}")
    print_kv("Foreign flags", f"{foreign_count:,}")
    print_kv("Archaic flags", f"{archaic_count:,}")
    print_kv("Rare flags", f"{rare_count:,}")

    score = con.execute(
        """
        SELECT
            ROUND(MIN(final_gameplay_score), 4) AS min_score,
            ROUND(AVG(final_gameplay_score), 4) AS avg_score,
            ROUND(MAX(final_gameplay_score), 4) AS max_score
        FROM word_game_scores
        WHERE language_code = ?
        """,
        (language_code,),
    ).fetchone()

    if score and score["avg_score"] is not None:
        print_kv(
            "Score min / avg / max",
            f"{score['min_score']} / {score['avg_score']} / {score['max_score']}",
        )

    rows = con.execute(
        """
        SELECT
            COALESCE(pos_primary, 'unknown') AS pos,
            COUNT(*) AS words
        FROM word_entries
        WHERE language_code = ?
        GROUP BY COALESCE(pos_primary, 'unknown')
        ORDER BY words DESC, pos ASC
        """,
        (language_code,),
    ).fetchall()

    print_section("POS BREAKDOWN")
    rows_as_table(rows, ["pos", "words"])

    rows = con.execute(
        """
        SELECT
            COALESCE(s.difficulty_tier, 'unrated') AS difficulty_tier,
            COUNT(*) AS words
        FROM word_entries w
        LEFT JOIN word_game_scores s ON s.word_id = w.word_id
        WHERE w.language_code = ?
        GROUP BY COALESCE(s.difficulty_tier, 'unrated')
        ORDER BY words DESC, difficulty_tier ASC
        """,
        (language_code,),
    ).fetchall()

    print_section("DIFFICULTY BREAKDOWN")
    rows_as_table(rows, ["difficulty_tier", "words"])

    rows = con.execute(
        """
        SELECT
            length,
            COUNT(*) AS words
        FROM word_entries
        WHERE language_code = ?
        GROUP BY length
        ORDER BY length ASC
        """,
        (language_code,),
    ).fetchall()

    print_section("LENGTH BREAKDOWN")
    rows_as_table(rows, ["length", "words"])

    rows = con.execute(
        """
        SELECT
            reject_code,
            COUNT(*) AS rejected
        FROM rejected_words
        WHERE language_code = ?
        GROUP BY reject_code
        ORDER BY rejected DESC, reject_code ASC
        LIMIT ?
        """,
        (language_code, limit),
    ).fetchall()

    print_section("TOP REJECT REASONS")
    rows_as_table(rows, ["reject_code", "rejected"])

    rows = con.execute(
        """
        SELECT
            build_id,
            status,
            started_at,
            finished_at
        FROM build_runs
        WHERE language_filter = ?
        ORDER BY started_at DESC
        LIMIT 5
        """,
        (language_code,),
    ).fetchall()

    print_section("RECENT BUILDS")
    rows_as_table(rows, ["build_id", "status", "started_at", "finished_at"])

    if show_samples:
        rows = con.execute(
            """
            SELECT
                w.word,
                w.display_word,
                w.pos_primary,
                w.length,
                ROUND(s.final_gameplay_score, 4) AS score,
                s.difficulty_tier
            FROM word_entries w
            LEFT JOIN word_game_scores s ON s.word_id = w.word_id
            WHERE w.language_code = ?
              AND w.is_active = 1
              AND w.gameplay_approved = 1
              AND w.review_status = 'approved'
            ORDER BY s.final_gameplay_score DESC, w.length ASC, w.word ASC
            LIMIT ?
            """,
            (language_code, limit),
        ).fetchall()

        print_section("SAMPLE APPROVED WORDS")
        rows_as_table(
            rows,
            ["word", "display_word", "pos_primary", "length", "score", "difficulty_tier"],
        )

        rows = con.execute(
            """
            SELECT
                word,
                normalized_word,
                review_type,
                priority,
                reason,
                status
            FROM review_queue
            WHERE language_code = ?
            ORDER BY priority DESC, created_at DESC
            LIMIT ?
            """,
            (language_code, limit),
        ).fetchall()

        print_section("SAMPLE REVIEW QUEUE")
        rows_as_table(
            rows,
            ["word", "normalized_word", "review_type", "priority", "reason", "status"],
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inspect Lexora word candidates stored in the master SQLite database."
    )

    parser.add_argument(
        "--language",
        "-l",
        default=None,
        help="Language code, for example: az, en, ru. If omitted, all languages are summarized.",
    )

    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_PATH),
        help="Path to lexora_words_master.sqlite",
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Rows to show in sample/reject sections.",
    )

    parser.add_argument(
        "--samples",
        action="store_true",
        help="Show approved-word and review-queue samples.",
    )

    return parser.parse_args()


def main() -> None:
    args = parse_args()
    db_path = Path(args.db).resolve()

    print_title("LEXORA WORD CANDIDATE INSPECTOR")
    print_kv("ENGINE", ENGINE_VERSION)
    print_kv("DB", db_path)

    con = connect_db(db_path)

    try:
        require_schema(con)
        languages = fetch_languages(con, args.language)
        inspect_all_summary(con)

        for language_code in languages:
            inspect_language(
                con=con,
                language_code=language_code,
                limit=max(1, int(args.limit)),
                show_samples=bool(args.samples),
            )

    finally:
        con.close()

    print()
    print("LEXORA_WORD_CANDIDATE_INSPECTOR_OK")


if __name__ == "__main__":
    main()
