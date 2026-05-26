from __future__ import annotations

import argparse
import json
import re
import sqlite3
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote

ENGINE_VERSION = "lexora_kaikki_word_candidate_importer_v1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml"
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "lexora_word_engine" / "lexora_words_master.sqlite"
RAW_ROOT = PROJECT_ROOT / "data" / "lexora_word_engine" / "raw" / "kaikki"

REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko", "ar"]
KAIKKI_BASE_URL = "https://kaikki.org/dictionary/{slug}/kaikki.org-dictionary-{slug}.jsonl"

POS_MAP = {
    "noun": "noun",
    "verb": "verb",
    "adj": "adjective",
    "adjective": "adjective",
    "adv": "adverb",
    "adverb": "adverb",
}

ALLOWED_POS = {"noun", "verb", "adjective", "adverb"}

BLOCKED_POS = {
    "abbrev",
    "abbreviation",
    "proper_name",
    "name",
    "surname",
    "given_name",
    "prefix",
    "suffix",
    "infix",
    "interfix",
    "circumfix",
    "phrase",
    "proverb",
    "prepositional_phrase",
    "adverbial_phrase",
    "contraction",
    "punct",
    "punctuation",
    "symbol",
    "letter",
    "character",
    "article",
    "conjunction",
    "determiner",
    "interjection",
    "numeral",
    "particle",
    "postposition",
    "preposition",
    "pronoun",
}

OFFENSIVE_MARKERS = {
    "offensive",
    "vulgar",
    "obscene",
    "slur",
    "derogatory",
    "profanity",
    "taboo",
    "ethnic slur",
    "racial slur",
    "sexual",
}

FOREIGN_MARKERS = {
    "foreign",
    "borrowed",
    "transliteration",
    "romanization",
}

ARCHAIC_MARKERS = {
    "archaic",
    "obsolete",
    "dated",
    "historical",
}

RARE_MARKERS = {
    "rare",
    "uncommon",
    "nonstandard",
}

PUNCT_OR_SPACE_RE = re.compile(r"[\s\-_'\u2019`´.,;:!?/\\()\[\]{}<>0-9]")
ARABIC_DIACRITICS = set("ًٌٍَُِّْ")


@dataclass(slots=True)
class Candidate:
    language_code: str
    word: str
    normalized_word: str
    display_word: str
    script: str
    pos_set: set[str] = field(default_factory=set)
    tags: set[str] = field(default_factory=set)
    categories: set[str] = field(default_factory=set)
    topics: set[str] = field(default_factory=set)
    source_count: int = 0
    definition_count: int = 0
    is_archaic: int = 0
    is_rare: int = 0
    is_foreign: int = 0


@dataclass(slots=True)
class ImportReport:
    language_code: str
    dictionary_slug: str
    raw_path: str
    status: str
    raw_lines: int
    accepted_candidates: int
    inserted_words: int
    gameplay_approved: int
    review_queue: int
    rejected_total: int
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


def kaikki_url(slug: str) -> str:
    return KAIKKI_BASE_URL.format(slug=quote(slug, safe=""))


def raw_path_for(language_code: str, slug: str) -> Path:
    safe_slug = slug.replace("/", "_").replace("\\", "_").replace(" ", "_")
    return RAW_ROOT / language_code / f"kaikki_{language_code}_{safe_slug}.jsonl"


def get_language_config(config: dict[str, Any], language_code: str) -> dict[str, Any]:
    languages = config.get("languages")
    if not isinstance(languages, dict):
        raise ValueError("languages.yaml missing languages dictionary")

    if language_code not in REQUIRED_LANGUAGES:
        raise ValueError(f"Unsupported language: {language_code}")

    if language_code not in languages:
        raise ValueError(f"Language not found in config: {language_code}")

    return languages[language_code]


def get_slug(lang: dict[str, Any]) -> str:
    slug = str(lang["sources"]["kaikki_wiktionary"]["dictionary_slug"]).strip()
    if not slug:
        raise ValueError("Missing Kaikki dictionary_slug")
    return slug


def normalize_pos(pos: Any) -> str:
    p = str(pos or "").strip().lower().replace(" ", "_").replace("-", "_")
    return POS_MAP.get(p, p)


def az_tr_lower(text: str) -> str:
    return text.replace("İ", "i").replace("I", "ı").lower()


def normalize_word(raw_word: str, language_code: str, lang: dict[str, Any]) -> str:
    word = str(raw_word or "").strip()

    normalize = lang.get("normalize") or {}
    lowercase = bool(normalize.get("lowercase", False))
    custom_i_policy = str(normalize.get("custom_i_policy") or "none")

    if lowercase:
        if custom_i_policy in {"azerbaijani_i", "turkish_i"}:
            word = az_tr_lower(word)
        else:
            word = word.lower()

    return word.strip()


def display_word(normalized_word: str, lang: dict[str, Any]) -> str:
    case_policy = str(lang.get("case_policy") or "")
    if case_policy == "uppercase_game_display_lowercase_storage":
        return normalized_word.upper()
    return normalized_word


def collect_list(obj: dict[str, Any], key: str) -> set[str]:
    value = obj.get(key)
    if isinstance(value, list):
        return {str(x).strip().lower() for x in value if str(x).strip()}
    return set()


def collect_metadata(obj: dict[str, Any]) -> tuple[set[str], set[str], set[str], int]:
    tags: set[str] = set()
    categories: set[str] = set()
    topics: set[str] = set()
    definition_count = 0

    tags |= collect_list(obj, "tags")
    tags |= collect_list(obj, "raw_tags")
    categories |= collect_list(obj, "categories")
    topics |= collect_list(obj, "topics")

    senses = obj.get("senses")
    if isinstance(senses, list):
        for sense in senses:
            if not isinstance(sense, dict):
                continue

            tags |= collect_list(sense, "tags")
            tags |= collect_list(sense, "raw_tags")
            categories |= collect_list(sense, "categories")
            topics |= collect_list(sense, "topics")

            glosses = sense.get("glosses")
            raw_glosses = sense.get("raw_glosses")
            if isinstance(glosses, list):
                definition_count += len(glosses)
            elif isinstance(raw_glosses, list):
                definition_count += len(raw_glosses)
            elif sense.get("gloss"):
                definition_count += 1

    return tags, categories, topics, definition_count


def has_any_marker(values: set[str], markers: set[str]) -> bool:
    joined = " ".join(sorted(values)).lower()
    return any(marker in joined for marker in markers)


def is_cjk(ch: str) -> bool:
    return "\u4e00" <= ch <= "\u9fff" or "\u3400" <= ch <= "\u4dbf"


def is_hiragana(ch: str) -> bool:
    return "\u3040" <= ch <= "\u309f"


def is_katakana(ch: str) -> bool:
    return "\u30a0" <= ch <= "\u30ff"


def is_hangul_syllable(ch: str) -> bool:
    return "\uac00" <= ch <= "\ud7a3"


def alphabet_valid(word: str, language_code: str, lang: dict[str, Any]) -> bool:
    if not word:
        return False

    script = str(lang["script"])
    alphabet = str(lang.get("alphabet") or "")
    allowed_extra = str(lang.get("allowed_extra_chars") or "")
    allowed_chars = set(alphabet + allowed_extra)

    if script in {"latin", "cyrillic", "devanagari", "arabic"}:
        return all(ch in allowed_chars for ch in word)

    if script == "han":
        return all(is_cjk(ch) for ch in word)

    if script == "kana":
        return all(is_hiragana(ch) or is_katakana(ch) or is_cjk(ch) or ch in allowed_extra for ch in word)

    if script == "hangul":
        return all(is_hangul_syllable(ch) for ch in word)

    return False


def has_punctuation_or_space(word: str, language_code: str) -> bool:
    if language_code in {"zh", "ja", "ko"}:
        return any(ch.isspace() or ch.isdigit() for ch in word)
    return bool(PUNCT_OR_SPACE_RE.search(word))


def length_valid(word: str, lang: dict[str, Any]) -> bool:
    n = len(word)
    return int(lang["min_word_length"]) <= n <= int(lang["max_word_length"])


def reject_code_for_entry(raw_word: str, normalized: str, raw_pos: str, pos: str, lang: dict[str, Any], tags: set[str], categories: set[str], topics: set[str], language_code: str) -> str | None:
    if not raw_word or not str(raw_word).strip():
        return "empty_word"

    if not normalized:
        return "empty_normalized_word"

    if pos in BLOCKED_POS:
        return f"blocked_pos_{pos}"

    if pos not in ALLOWED_POS:
        return f"pos_not_allowed_{pos or 'missing'}"

    all_meta = tags | categories | topics

    if has_any_marker(all_meta, OFFENSIVE_MARKERS):
        return "offensive_or_sensitive"

    if has_punctuation_or_space(normalized, language_code):
        return "phrase_punctuation_digit_or_space"

    if not length_valid(normalized, lang):
        return "length_out_of_policy"

    if not alphabet_valid(normalized, language_code, lang):
        return "alphabet_invalid"

    return None


def gameplay_scores(candidate: Candidate, lang: dict[str, Any]) -> dict[str, Any]:
    min_len = int(lang["min_word_length"])
    max_len = int(lang["max_word_length"])
    n = len(candidate.normalized_word)

    if n < min_len or n > max_len:
        length_score = 0.0
    else:
        span = max(1, max_len - min_len)
        center = min_len + span * 0.45
        distance = abs(n - center) / max(1, span)
        length_score = max(35.0, 100.0 - distance * 90.0)

    source_reliability_score = 95.0

    pos_quality_score = 0.0
    if "noun" in candidate.pos_set:
        pos_quality_score = max(pos_quality_score, 96.0)
    if "verb" in candidate.pos_set:
        pos_quality_score = max(pos_quality_score, 92.0)
    if "adjective" in candidate.pos_set:
        pos_quality_score = max(pos_quality_score, 86.0)
    if "adverb" in candidate.pos_set:
        pos_quality_score = max(pos_quality_score, 78.0)

    frequency_score = min(100.0, 45.0 + candidate.source_count * 7.0 + candidate.definition_count * 1.5)

    letter_rarity_score = 72.0
    if candidate.language_code in {"zh", "ja", "ko", "hi", "ar"}:
        letter_rarity_score = 75.0

    family_safe_score = 100.0
    if candidate.is_archaic:
        family_safe_score -= 10.0
    if candidate.is_rare:
        family_safe_score -= 8.0
    if candidate.is_foreign:
        family_safe_score -= 12.0

    puzzle_utility_score = (length_score * 0.55) + (pos_quality_score * 0.25) + (letter_rarity_score * 0.20)

    final_score = (
        length_score * 0.25
        + frequency_score * 0.15
        + letter_rarity_score * 0.10
        + source_reliability_score * 0.15
        + pos_quality_score * 0.15
        + family_safe_score * 0.10
        + puzzle_utility_score * 0.10
    )

    if candidate.is_archaic:
        final_score -= 8.0
    if candidate.is_rare:
        final_score -= 6.0
    if candidate.is_foreign:
        final_score -= 10.0

    final_score = max(0.0, min(100.0, final_score))

    if final_score >= 82:
        difficulty_tier = "core"
    elif final_score >= 70:
        difficulty_tier = "standard"
    elif final_score >= 58:
        difficulty_tier = "advanced"
    else:
        difficulty_tier = "review"

    return {
        "length_score": round(length_score, 4),
        "frequency_score": round(frequency_score, 4),
        "letter_rarity_score": round(letter_rarity_score, 4),
        "source_reliability_score": round(source_reliability_score, 4),
        "pos_quality_score": round(pos_quality_score, 4),
        "family_safe_score": round(family_safe_score, 4),
        "puzzle_utility_score": round(puzzle_utility_score, 4),
        "final_gameplay_score": round(final_score, 4),
        "difficulty_tier": difficulty_tier,
    }


def create_build_run(con: sqlite3.Connection, language_code: str) -> str:
    build_id = f"kaikki_import_{language_code}_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
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
            "kaikki_word_candidate_import",
            language_code,
            now,
            None,
            "RUNNING",
            "",
            "{}",
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


def clear_language(con: sqlite3.Connection, language_code: str) -> None:
    con.execute("DELETE FROM word_entries WHERE language_code = ?", (language_code,))
    con.execute("DELETE FROM rejected_words WHERE language_code = ?", (language_code,))
    con.execute("DELETE FROM review_queue WHERE language_code = ?", (language_code,))
    con.execute("DELETE FROM build_reports WHERE language_code = ? AND report_type = 'kaikki_import'", (language_code,))


def insert_rejected_samples(con: sqlite3.Connection, build_id: str, language_code: str, rejected_samples: list[dict[str, Any]]) -> None:
    now = utc_now()
    rows = []
    for item in rejected_samples:
        rows.append(
            (
                build_id,
                language_code,
                str(item.get("raw_word") or "")[:300],
                str(item.get("normalized_word") or "")[:300],
                "kaikki_wiktionary",
                str(item.get("source_pos") or "")[:80],
                "kaikki_stream_parse",
                str(item.get("reject_code") or "")[:160],
                str(item.get("reject_reason") or "")[:500],
                json.dumps(item.get("evidence") or {}, ensure_ascii=False, sort_keys=True),
                now,
            )
        )

    if rows:
        con.executemany(
            """
            INSERT INTO rejected_words (
                build_id, language_code, raw_word, normalized_word, source_id, source_pos,
                reject_stage, reject_code, reject_reason, evidence_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )


def insert_build_metric(con: sqlite3.Connection, build_id: str, language_code: str, metric_name: str, metric_value: Any, details: dict[str, Any] | None = None) -> None:
    con.execute(
        """
        INSERT INTO build_reports (
            build_id, language_code, report_type, metric_name, metric_value, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            build_id,
            language_code,
            "kaikki_import",
            metric_name,
            str(metric_value),
            json.dumps(details or {}, ensure_ascii=False, sort_keys=True),
            utc_now(),
        ),
    )


def parse_raw_language(config: dict[str, Any], language_code: str, max_rejected_samples: int) -> tuple[dict[str, Candidate], Counter[str], list[dict[str, Any]], int, Path, str]:
    lang = get_language_config(config, language_code)
    slug = get_slug(lang)
    path = raw_path_for(language_code, slug)

    if not path.exists():
        raise FileNotFoundError(f"Raw file not found: {path}")

    candidates: dict[str, Candidate] = {}
    reject_counts: Counter[str] = Counter()
    rejected_samples: list[dict[str, Any]] = []

    raw_lines = 0
    last_print = time.time()

    print()
    print(f"IMPORT PARSE {language_code} | {slug}")
    print("-" * 100)
    print("RAW:", path)

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            raw_lines += 1
            line = line.strip()

            if not line:
                reject_counts["empty_line"] += 1
                continue

            try:
                obj = json.loads(line)
            except Exception:
                reject_counts["invalid_json"] += 1
                if len(rejected_samples) < max_rejected_samples:
                    rejected_samples.append(
                        {
                            "raw_word": "",
                            "normalized_word": "",
                            "source_pos": "",
                            "reject_code": "invalid_json",
                            "reject_reason": "JSON parse failed",
                            "evidence": {"line_no": raw_lines},
                        }
                    )
                continue

            raw_word = str(obj.get("word") or "").strip()
            raw_pos = str(obj.get("pos") or "").strip()
            pos = normalize_pos(raw_pos)
            normalized = normalize_word(raw_word, language_code, lang)
            tags, categories, topics, definition_count = collect_metadata(obj)

            reject_code = reject_code_for_entry(
                raw_word=raw_word,
                normalized=normalized,
                raw_pos=raw_pos,
                pos=pos,
                lang=lang,
                tags=tags,
                categories=categories,
                topics=topics,
                language_code=language_code,
            )

            if reject_code:
                reject_counts[reject_code] += 1
                if len(rejected_samples) < max_rejected_samples:
                    rejected_samples.append(
                        {
                            "raw_word": raw_word,
                            "normalized_word": normalized,
                            "source_pos": raw_pos,
                            "reject_code": reject_code,
                            "reject_reason": reject_code,
                            "evidence": {
                                "tags": sorted(tags)[:20],
                                "categories": sorted(categories)[:20],
                                "topics": sorted(topics)[:20],
                            },
                        }
                    )
                continue

            key = normalized
            if key not in candidates:
                candidates[key] = Candidate(
                    language_code=language_code,
                    word=normalized,
                    normalized_word=normalized,
                    display_word=display_word(normalized, lang),
                    script=str(lang["script"]),
                )

            c = candidates[key]
            c.pos_set.add(pos)
            c.tags.update(list(tags)[:30])
            c.categories.update(list(categories)[:30])
            c.topics.update(list(topics)[:30])
            c.source_count += 1
            c.definition_count += int(definition_count)
            meta = tags | categories | topics
            c.is_archaic = int(c.is_archaic or has_any_marker(meta, ARCHAIC_MARKERS))
            c.is_rare = int(c.is_rare or has_any_marker(meta, RARE_MARKERS))
            c.is_foreign = int(c.is_foreign or has_any_marker(meta, FOREIGN_MARKERS))

            now = time.time()
            if now - last_print >= 3:
                print(
                    f"  {language_code}: lines={raw_lines:,} | candidates={len(candidates):,} | rejected={sum(reject_counts.values()):,}",
                    flush=True,
                )
                last_print = now

    return candidates, reject_counts, rejected_samples, raw_lines, path, slug


def import_candidates(con: sqlite3.Connection, build_id: str, language_code: str, lang: dict[str, Any], candidates: dict[str, Candidate]) -> tuple[int, int, int]:
    now = utc_now()
    min_score = float((lang.get("gameplay") or {}).get("min_gameplay_score") or 60)

    word_rows = []
    source_rows_pending = []
    score_rows_pending = []
    review_rows_pending = []
    flag_rows_pending = []

    gameplay_approved = 0
    review_count = 0

    for c in candidates.values():
        scores = gameplay_scores(c, lang)
        final_score = float(scores["final_gameplay_score"])

        flags: list[tuple[str, str, str]] = []
        if c.is_archaic:
            flags.append(("archaic", "warning", "Archaic/dating marker detected"))
        if c.is_rare:
            flags.append(("rare", "warning", "Rare/uncommon marker detected"))
        if c.is_foreign:
            flags.append(("foreign", "warning", "Foreign/transliteration marker detected"))
        if final_score < min_score:
            flags.append(("low_gameplay_score", "review", f"Score below language threshold {min_score}"))

        approved = int(final_score >= min_score and not c.is_foreign and final_score >= 1)
        review_status = "approved" if approved else "pending"

        if approved:
            gameplay_approved += 1
        else:
            review_count += 1

        pos_all = sorted(c.pos_set)
        pos_primary = pos_all[0] if pos_all else None
        if "noun" in c.pos_set:
            pos_primary = "noun"
        elif "verb" in c.pos_set:
            pos_primary = "verb"

        word_rows.append(
            (
                language_code,
                c.word,
                c.normalized_word,
                c.display_word,
                c.script,
                len(c.normalized_word),
                pos_primary,
                json.dumps(pos_all, ensure_ascii=False),
                c.definition_count,
                c.source_count,
                1,
                1,
                approved,
                review_status,
                None if approved else "quality_gate_review",
                0,
                0,
                0,
                0,
                c.is_foreign,
                c.is_archaic,
                c.is_rare,
                0,
                None,
                now,
                now,
            )
        )

        source_rows_pending.append((c.normalized_word, c))
        score_rows_pending.append((c.normalized_word, scores))
        review_rows_pending.append((c.normalized_word, c, approved, final_score, flags))
        flag_rows_pending.append((c.normalized_word, flags))

    con.executemany(
        """
        INSERT INTO word_entries (
            language_code, word, normalized_word, display_word, script, length,
            pos_primary, pos_all_json, definition_count, source_count,
            alphabet_valid, is_active, gameplay_approved, review_status, review_reason,
            is_proper_name, is_offensive, is_abbreviation, is_phrase, is_foreign,
            is_archaic, is_rare, is_duplicate_merged, canonical_word_id,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(language_code, normalized_word) DO UPDATE SET
            word=excluded.word,
            display_word=excluded.display_word,
            script=excluded.script,
            length=excluded.length,
            pos_primary=excluded.pos_primary,
            pos_all_json=excluded.pos_all_json,
            definition_count=excluded.definition_count,
            source_count=excluded.source_count,
            alphabet_valid=excluded.alphabet_valid,
            is_active=excluded.is_active,
            gameplay_approved=excluded.gameplay_approved,
            review_status=excluded.review_status,
            review_reason=excluded.review_reason,
            is_foreign=excluded.is_foreign,
            is_archaic=excluded.is_archaic,
            is_rare=excluded.is_rare,
            updated_at=excluded.updated_at
        """,
        word_rows,
    )

    rows = con.execute(
        "SELECT word_id, normalized_word FROM word_entries WHERE language_code = ?",
        (language_code,),
    ).fetchall()
    word_id_by_norm = {str(norm): int(word_id) for word_id, norm in rows}

    source_rows = []
    score_rows = []
    review_rows = []
    flag_rows = []

    for norm, c in source_rows_pending:
        word_id = word_id_by_norm[norm]
        source_rows.append(
            (
                word_id,
                language_code,
                "kaikki_wiktionary",
                c.word,
                ",".join(sorted(c.pos_set)),
                json.dumps(sorted(c.tags)[:80], ensure_ascii=False),
                json.dumps(sorted(c.categories)[:80], ensure_ascii=False),
                json.dumps(sorted(c.topics)[:80], ensure_ascii=False),
                "",
                0.95,
                now,
            )
        )

    for norm, scores in score_rows_pending:
        word_id = word_id_by_norm[norm]
        score_rows.append(
            (
                word_id,
                language_code,
                scores["length_score"],
                scores["frequency_score"],
                scores["letter_rarity_score"],
                scores["source_reliability_score"],
                scores["pos_quality_score"],
                scores["family_safe_score"],
                scores["puzzle_utility_score"],
                scores["final_gameplay_score"],
                scores["difficulty_tier"],
                json.dumps(scores, ensure_ascii=False, sort_keys=True),
                now,
                now,
            )
        )

    for norm, c, approved, final_score, flags in review_rows_pending:
        if approved:
            continue
        word_id = word_id_by_norm[norm]
        review_rows.append(
            (
                word_id,
                language_code,
                c.word,
                c.normalized_word,
                "quality_gate",
                70,
                f"Requires review. gameplay_score={final_score}",
                json.dumps({"flags": flags, "source_count": c.source_count}, ensure_ascii=False),
                "pending",
                None,
                None,
                None,
                now,
            )
        )

    for norm, flags in flag_rows_pending:
        if not flags:
            continue
        word_id = word_id_by_norm[norm]
        for code, level, reason in flags:
            flag_rows.append(
                (
                    word_id,
                    language_code,
                    code,
                    level,
                    reason,
                    json.dumps({}, ensure_ascii=False),
                    now,
                )
            )

    if source_rows:
        con.executemany(
            """
            INSERT INTO word_sources (
                word_id, language_code, source_id, source_word, source_pos,
                source_tags_json, source_categories_json, source_topics_json,
                source_raw_ref, source_confidence, imported_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            source_rows,
        )

    if score_rows:
        con.executemany(
            """
            INSERT INTO word_game_scores (
                word_id, language_code, length_score, frequency_score, letter_rarity_score,
                source_reliability_score, pos_quality_score, family_safe_score,
                puzzle_utility_score, final_gameplay_score, difficulty_tier,
                score_reasons_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(word_id) DO UPDATE SET
                length_score=excluded.length_score,
                frequency_score=excluded.frequency_score,
                letter_rarity_score=excluded.letter_rarity_score,
                source_reliability_score=excluded.source_reliability_score,
                pos_quality_score=excluded.pos_quality_score,
                family_safe_score=excluded.family_safe_score,
                puzzle_utility_score=excluded.puzzle_utility_score,
                final_gameplay_score=excluded.final_gameplay_score,
                difficulty_tier=excluded.difficulty_tier,
                score_reasons_json=excluded.score_reasons_json,
                updated_at=excluded.updated_at
            """,
            score_rows,
        )

    if review_rows:
        con.executemany(
            """
            INSERT INTO review_queue (
                word_id, language_code, word, normalized_word, review_type,
                priority, reason, evidence_json, status, reviewer,
                reviewer_note, reviewed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            review_rows,
        )

    if flag_rows:
        con.executemany(
            """
            INSERT INTO word_quality_flags (
                word_id, language_code, flag_code, flag_level, flag_reason, evidence_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            flag_rows,
        )

    return len(word_rows), gameplay_approved, review_count


def run_import(language_code: str, db_path: Path, replace_language: bool, write: bool, max_rejected_samples: int) -> ImportReport:
    started = time.time()
    config = load_yaml(CONFIG_PATH)
    lang = get_language_config(config, language_code)
    slug = get_slug(lang)
    raw_path = raw_path_for(language_code, slug)

    con = connect_db(db_path)
    build_id = create_build_run(con, language_code)
    con.commit()

    try:
        candidates, reject_counts, rejected_samples, raw_lines, path, slug = parse_raw_language(
            config=config,
            language_code=language_code,
            max_rejected_samples=max_rejected_samples,
        )

        inserted_words = 0
        gameplay_approved = 0
        review_count = 0

        if write:
            if replace_language:
                clear_language(con, language_code)

            inserted_words, gameplay_approved, review_count = import_candidates(
                con=con,
                build_id=build_id,
                language_code=language_code,
                lang=lang,
                candidates=candidates,
            )

            insert_rejected_samples(con, build_id, language_code, rejected_samples)

            insert_build_metric(con, build_id, language_code, "raw_lines", raw_lines)
            insert_build_metric(con, build_id, language_code, "accepted_candidates", len(candidates))
            insert_build_metric(con, build_id, language_code, "inserted_words", inserted_words)
            insert_build_metric(con, build_id, language_code, "gameplay_approved", gameplay_approved)
            insert_build_metric(con, build_id, language_code, "review_queue", review_count)
            insert_build_metric(con, build_id, language_code, "rejected_total", sum(reject_counts.values()))
            insert_build_metric(con, build_id, language_code, "reject_counts", json.dumps(dict(reject_counts), ensure_ascii=False), dict(reject_counts))

        summary = {
            "language_code": language_code,
            "raw_lines": raw_lines,
            "accepted_candidates": len(candidates),
            "inserted_words": inserted_words,
            "gameplay_approved": gameplay_approved,
            "review_queue": review_count,
            "rejected_total": sum(reject_counts.values()),
            "reject_counts": dict(reject_counts),
            "write": write,
            "replace_language": replace_language,
        }

        finish_build_run(con, build_id, "OK", summary)
        con.commit()

        return ImportReport(
            language_code=language_code,
            dictionary_slug=slug,
            raw_path=str(raw_path),
            status="OK",
            raw_lines=raw_lines,
            accepted_candidates=len(candidates),
            inserted_words=inserted_words,
            gameplay_approved=gameplay_approved,
            review_queue=review_count,
            rejected_total=sum(reject_counts.values()),
            elapsed_seconds=round(time.time() - started, 3),
            error="",
        )

    except Exception as exc:
        con.rollback()
        finish_build_run(con, build_id, "FAILED", {"language_code": language_code}, error=str(exc))
        con.commit()

        return ImportReport(
            language_code=language_code,
            dictionary_slug=slug,
            raw_path=str(raw_path),
            status="FAILED",
            raw_lines=0,
            accepted_candidates=0,
            inserted_words=0,
            gameplay_approved=0,
            review_queue=0,
            rejected_total=0,
            elapsed_seconds=round(time.time() - started, 3),
            error=str(exc),
        )

    finally:
        con.close()


def print_report(report: ImportReport) -> None:
    print()
    print("LEXORA KAIKKI WORD CANDIDATE IMPORTER")
    print("=" * 100)
    print("ENGINE:", ENGINE_VERSION)
    print("LANGUAGE:", report.language_code)
    print("DICTIONARY:", report.dictionary_slug)
    print("STATUS:", report.status)
    print("RAW LINES:", report.raw_lines)
    print("ACCEPTED CANDIDATES:", report.accepted_candidates)
    print("INSERTED WORDS:", report.inserted_words)
    print("GAMEPLAY APPROVED:", report.gameplay_approved)
    print("REVIEW QUEUE:", report.review_queue)
    print("REJECTED TOTAL:", report.rejected_total)
    print("SECONDS:", report.elapsed_seconds)
    print("RAW:", report.raw_path)

    if report.error:
        print("ERROR:", report.error)
        print("LEXORA_KAIKKI_WORD_CANDIDATE_IMPORTER_FAILED")
    else:
        print("LEXORA_KAIKKI_WORD_CANDIDATE_IMPORTER_OK")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Import Kaikki raw JSONL into Lexora master word candidate tables.")
    p.add_argument("--language", required=True, choices=REQUIRED_LANGUAGES)
    p.add_argument("--db", default=str(DEFAULT_DB_PATH))
    p.add_argument("--write", action="store_true")
    p.add_argument("--replace-language", action="store_true")
    p.add_argument("--max-rejected-samples", type=int, default=5000)
    return p.parse_args()


def main() -> int:
    args = parse_args()

    report = run_import(
        language_code=str(args.language),
        db_path=Path(args.db),
        replace_language=bool(args.replace_language),
        write=bool(args.write),
        max_rejected_samples=int(args.max_rejected_samples),
    )

    print_report(report)
    return 0 if report.status == "OK" else 1


if __name__ == "__main__":
    raise SystemExit(main())
