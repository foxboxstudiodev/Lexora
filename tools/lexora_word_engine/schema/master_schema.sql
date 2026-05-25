-- Lexora Word Engine — Master SQLite Schema
-- =========================================
--
-- Purpose
-- -------
-- Professional multilingual word-base schema for Lexora.
-- Supports 13 active languages from src/features/i18n/languages.ts:
-- en, es, ru, tr, de, pt, it, fr, az, hi, zh, ja, ko.
--
-- Principle
-- ---------
-- No temporary/simple/MVP structure. This schema is designed for:
--   - per-language word processing
--   - source attribution and license tracking
--   - strict validation
--   - rejected word audit
--   - manual review workflow
--   - gameplay scoring
--   - export to game-ready packs
--
-- SQLite target file:
--   data/lexora_word_engine/lexora_words_master.sqlite

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

CREATE TABLE IF NOT EXISTS languages (
    language_code TEXT PRIMARY KEY,
    english_name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    script TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    target_level_count INTEGER NOT NULL DEFAULT 300,
    min_wheel_letters INTEGER NOT NULL DEFAULT 4,
    supports_accents INTEGER NOT NULL DEFAULT 0,
    min_word_length INTEGER NOT NULL,
    max_word_length INTEGER NOT NULL,
    alphabet TEXT NOT NULL,
    allowed_extra_chars TEXT DEFAULT '',
    case_policy TEXT NOT NULL,
    normalization_policy_json TEXT NOT NULL,
    gameplay_policy_json TEXT NOT NULL,
    source_policy_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_licenses (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT,
    license_name TEXT,
    license_url TEXT,
    attribution_required INTEGER NOT NULL DEFAULT 1,
    share_alike_required INTEGER NOT NULL DEFAULT 0,
    commercial_use_allowed INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS build_runs (
    build_id TEXT PRIMARY KEY,
    engine_version TEXT NOT NULL,
    build_mode TEXT NOT NULL,
    language_filter TEXT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    config_hash TEXT,
    source_snapshot_json TEXT,
    summary_json TEXT,
    error_json TEXT
);

CREATE TABLE IF NOT EXISTS word_entries (
    word_id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_code TEXT NOT NULL,
    word TEXT NOT NULL,
    normalized_word TEXT NOT NULL,
    display_word TEXT NOT NULL,
    script TEXT NOT NULL,
    length INTEGER NOT NULL,
    pos_primary TEXT,
    pos_all_json TEXT NOT NULL DEFAULT '[]',
    definition_count INTEGER NOT NULL DEFAULT 0,
    source_count INTEGER NOT NULL DEFAULT 0,
    alphabet_valid INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0,
    gameplay_approved INTEGER NOT NULL DEFAULT 0,
    review_status TEXT NOT NULL DEFAULT 'pending',
    review_reason TEXT,
    is_proper_name INTEGER NOT NULL DEFAULT 0,
    is_offensive INTEGER NOT NULL DEFAULT 0,
    is_abbreviation INTEGER NOT NULL DEFAULT 0,
    is_phrase INTEGER NOT NULL DEFAULT 0,
    is_foreign INTEGER NOT NULL DEFAULT 0,
    is_archaic INTEGER NOT NULL DEFAULT 0,
    is_rare INTEGER NOT NULL DEFAULT 0,
    is_duplicate_merged INTEGER NOT NULL DEFAULT 0,
    canonical_word_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    FOREIGN KEY(canonical_word_id) REFERENCES word_entries(word_id),
    UNIQUE(language_code, normalized_word)
);

CREATE TABLE IF NOT EXISTS word_sources (
    word_source_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source_word TEXT NOT NULL,
    source_pos TEXT,
    source_tags_json TEXT NOT NULL DEFAULT '[]',
    source_categories_json TEXT NOT NULL DEFAULT '[]',
    source_topics_json TEXT NOT NULL DEFAULT '[]',
    source_raw_ref TEXT,
    source_confidence REAL NOT NULL DEFAULT 0.0,
    imported_at TEXT NOT NULL,
    FOREIGN KEY(word_id) REFERENCES word_entries(word_id) ON DELETE CASCADE,
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    FOREIGN KEY(source_id) REFERENCES source_licenses(source_id)
);

CREATE TABLE IF NOT EXISTS word_forms (
    word_form_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    form TEXT NOT NULL,
    normalized_form TEXT NOT NULL,
    form_type TEXT NOT NULL,
    pos TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    is_gameplay_candidate INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(word_id) REFERENCES word_entries(word_id) ON DELETE CASCADE,
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    UNIQUE(language_code, normalized_form, form_type)
);

CREATE TABLE IF NOT EXISTS word_quality_flags (
    flag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    flag_code TEXT NOT NULL,
    flag_level TEXT NOT NULL,
    flag_reason TEXT NOT NULL,
    evidence_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(word_id) REFERENCES word_entries(word_id) ON DELETE CASCADE,
    FOREIGN KEY(language_code) REFERENCES languages(language_code)
);

CREATE TABLE IF NOT EXISTS word_game_scores (
    score_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    length_score REAL NOT NULL DEFAULT 0.0,
    frequency_score REAL NOT NULL DEFAULT 0.0,
    letter_rarity_score REAL NOT NULL DEFAULT 0.0,
    source_reliability_score REAL NOT NULL DEFAULT 0.0,
    pos_quality_score REAL NOT NULL DEFAULT 0.0,
    family_safe_score REAL NOT NULL DEFAULT 0.0,
    puzzle_utility_score REAL NOT NULL DEFAULT 0.0,
    final_gameplay_score REAL NOT NULL DEFAULT 0.0,
    difficulty_tier TEXT NOT NULL DEFAULT 'unrated',
    score_reasons_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(word_id) REFERENCES word_entries(word_id) ON DELETE CASCADE,
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    UNIQUE(word_id)
);

CREATE TABLE IF NOT EXISTS rejected_words (
    rejected_id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_id TEXT,
    language_code TEXT NOT NULL,
    raw_word TEXT NOT NULL,
    normalized_word TEXT,
    source_id TEXT,
    source_pos TEXT,
    reject_stage TEXT NOT NULL,
    reject_code TEXT NOT NULL,
    reject_reason TEXT NOT NULL,
    evidence_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(build_id) REFERENCES build_runs(build_id),
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    FOREIGN KEY(source_id) REFERENCES source_licenses(source_id)
);

CREATE TABLE IF NOT EXISTS review_queue (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER,
    language_code TEXT NOT NULL,
    word TEXT NOT NULL,
    normalized_word TEXT NOT NULL,
    review_type TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 50,
    reason TEXT NOT NULL,
    evidence_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    reviewer TEXT,
    reviewer_note TEXT,
    reviewed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(word_id) REFERENCES word_entries(word_id) ON DELETE CASCADE,
    FOREIGN KEY(language_code) REFERENCES languages(language_code)
);

CREATE TABLE IF NOT EXISTS manual_overrides (
    override_id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_code TEXT NOT NULL,
    word TEXT NOT NULL,
    normalized_word TEXT NOT NULL,
    override_type TEXT NOT NULL,
    override_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    author TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(language_code) REFERENCES languages(language_code),
    UNIQUE(language_code, normalized_word, override_type)
);

CREATE TABLE IF NOT EXISTS exported_word_packs (
    export_id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_id TEXT,
    language_code TEXT NOT NULL,
    export_type TEXT NOT NULL,
    export_path TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    checksum_sha256 TEXT,
    export_config_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(build_id) REFERENCES build_runs(build_id),
    FOREIGN KEY(language_code) REFERENCES languages(language_code)
);

CREATE TABLE IF NOT EXISTS build_reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_id TEXT NOT NULL,
    language_code TEXT,
    report_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    details_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(build_id) REFERENCES build_runs(build_id),
    FOREIGN KEY(language_code) REFERENCES languages(language_code)
);

CREATE VIEW IF NOT EXISTS vw_game_approved_words AS
SELECT
    w.word_id,
    w.language_code,
    w.word,
    w.normalized_word,
    w.display_word,
    w.script,
    w.length,
    w.pos_primary,
    w.review_status,
    s.final_gameplay_score,
    s.difficulty_tier
FROM word_entries w
LEFT JOIN word_game_scores s ON s.word_id = w.word_id
WHERE w.is_active = 1
  AND w.gameplay_approved = 1
  AND w.review_status = 'approved'
  AND w.alphabet_valid = 1
  AND w.is_proper_name = 0
  AND w.is_offensive = 0
  AND w.is_abbreviation = 0
  AND w.is_phrase = 0;

CREATE VIEW IF NOT EXISTS vw_language_build_summary AS
SELECT
    l.language_code,
    l.english_name,
    l.native_name,
    l.script,
    COUNT(w.word_id) AS total_words,
    SUM(CASE WHEN w.alphabet_valid = 1 THEN 1 ELSE 0 END) AS alphabet_valid_words,
    SUM(CASE WHEN w.is_active = 1 THEN 1 ELSE 0 END) AS active_words,
    SUM(CASE WHEN w.gameplay_approved = 1 THEN 1 ELSE 0 END) AS gameplay_approved_words,
    SUM(CASE WHEN w.review_status = 'pending' THEN 1 ELSE 0 END) AS pending_review_words,
    SUM(CASE WHEN w.review_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_review_words
FROM languages l
LEFT JOIN word_entries w ON w.language_code = l.language_code
GROUP BY l.language_code, l.english_name, l.native_name, l.script;

CREATE INDEX IF NOT EXISTS idx_word_entries_language ON word_entries(language_code);
CREATE INDEX IF NOT EXISTS idx_word_entries_normalized ON word_entries(language_code, normalized_word);
CREATE INDEX IF NOT EXISTS idx_word_entries_active ON word_entries(language_code, is_active, gameplay_approved, review_status);
CREATE INDEX IF NOT EXISTS idx_word_entries_length ON word_entries(language_code, length);
CREATE INDEX IF NOT EXISTS idx_word_entries_pos ON word_entries(language_code, pos_primary);
CREATE INDEX IF NOT EXISTS idx_word_sources_word ON word_sources(word_id);
CREATE INDEX IF NOT EXISTS idx_word_sources_source ON word_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_word_forms_word ON word_forms(word_id);
CREATE INDEX IF NOT EXISTS idx_quality_flags_word ON word_quality_flags(word_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_word ON word_game_scores(word_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_language_score ON word_game_scores(language_code, final_gameplay_score DESC);
CREATE INDEX IF NOT EXISTS idx_rejected_language ON rejected_words(language_code, reject_code);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(language_code, status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_exports_language ON exported_word_packs(language_code, export_type);
