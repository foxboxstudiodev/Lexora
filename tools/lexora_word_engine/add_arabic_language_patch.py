from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEXORA_TARGET_LEVEL_COUNT = 1000

FILES = {
    "languages_ts": ROOT / "src" / "features" / "i18n" / "languages.ts",
    "translations_ts": ROOT / "src" / "features" / "i18n" / "translations.ts",
    "languages_yaml": ROOT / "tools" / "lexora_word_engine" / "config" / "languages.yaml",
    "init_db": ROOT / "tools" / "lexora_word_engine" / "init_master_db.py",
    "raw_downloader": ROOT / "tools" / "lexora_word_engine" / "sources" / "download_kaikki_raw_sources.py",
    "strict_downloader": ROOT / "tools" / "lexora_word_engine" / "sources" / "download_kaikki_single_strict.py",
}


def read(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return path.read_text(encoding="utf-8-sig")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Pattern not found: {label}")
    return text.replace(old, new, 1)


def patch_languages_ts() -> None:
    path = FILES["languages_ts"]
    text = read(path)

    if "'ar'" in text:
        write(path, text)
        return

    text = replace_once(
        text,
        "export type ActiveLanguageCode = 'en' | 'es' | 'ru' | 'tr' | 'de' | 'pt' | 'it' | 'fr' | 'az' | 'hi' | 'zh' | 'ja' | 'ko';",
        "export type ActiveLanguageCode = 'en' | 'es' | 'ru' | 'tr' | 'de' | 'pt' | 'it' | 'fr' | 'az' | 'hi' | 'zh' | 'ja' | 'ko' | 'ar';",
        "ActiveLanguageCode",
    )
    text = replace_once(
        text,
        "export type ScriptKind = 'latin' | 'cyrillic' | 'devanagari' | 'han' | 'kana' | 'hangul';",
        "export type ScriptKind = 'latin' | 'cyrillic' | 'devanagari' | 'han' | 'kana' | 'hangul' | 'arabic';",
        "ScriptKind",
    )
    text = replace_once(
        text,
        "export const ACTIVE_LANGUAGES: ActiveLanguageCode[] = ['en', 'es', 'ru', 'tr', 'de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko'];",
        "export const ACTIVE_LANGUAGES: ActiveLanguageCode[] = ['en', 'es', 'ru', 'tr', 'de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko', 'ar'];",
        "ACTIVE_LANGUAGES",
    )
    text = replace_once(
        text,
        "  ko: { code: 'ko', englishName: 'Korean', nativeName: '한국어', script: 'hangul', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },\n};",
        "  ko: { code: 'ko', englishName: 'Korean', nativeName: '한국어', script: 'hangul', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },\n  ar: { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', script: 'arabic', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },\n};",
        "languageRegistry ar",
    )
    write(path, text)


def patch_translations_ts() -> None:
    path = FILES["translations_ts"]
    text = read(path)

    if "\n  ar:" in text:
        write(path, text)
        return

    text = replace_once(
        text,
        "  ko: withLanguageName('한국어', { title: '단어 여행', play: '시작', level: '레벨', levels: '레벨', languages: '언어', coins: '코인', hint: '힌트', hintLetter: '글자', hintStart: '시작', hintWord: '단어', hintsUsed: '사용한 힌트', invalid: '이 퍼즐에 없습니다', tooShort: '너무 짧음', notInPuzzle: '이 퍼즐에 없습니다', alreadyFound: '이미 찾음', notEnoughCoins: '코인이 부족합니다', next: '다음', back: '뒤로' }),\n};",
        "  ko: withLanguageName('한국어', { title: '단어 여행', play: '시작', level: '레벨', levels: '레벨', languages: '언어', coins: '코인', hint: '힌트', hintLetter: '글자', hintStart: '시작', hintWord: '단어', hintsUsed: '사용한 힌트', invalid: '이 퍼즐에 없습니다', tooShort: '너무 짧음', notInPuzzle: '이 퍼즐에 없습니다', alreadyFound: '이미 찾음', notEnoughCoins: '코인이 부족합니다', next: '다음', back: '뒤로' }),\n  ar: withLanguageName('العربية', { title: 'رحلة الكلمات', play: 'العب', level: 'المستوى', levels: 'المستويات', languages: 'اللغات', coins: 'عملات', hint: 'تلميح', hintLetter: 'حرف', hintStart: 'البداية', hintWord: 'كلمة', hintsUsed: 'التلميحات المستخدمة', invalid: 'ليست في هذا اللغز', tooShort: 'قصيرة جدًا', notInPuzzle: 'ليست في هذا اللغز', alreadyFound: 'تم العثور عليها', notEnoughCoins: 'عملات غير كافية', next: 'التالي', back: 'رجوع' }),\n};",
        "translations ar",
    )
    write(path, text)


def patch_languages_yaml() -> None:
    path = FILES["languages_yaml"]
    text = read(path)

    text = text.replace("active languages: 13", "active languages: 14")
    text = text.replace("target levels per language: 300", f"target levels per language: {LEXORA_TARGET_LEVEL_COUNT}")
    text = text.replace("default_target_level_count: 300", f"default_target_level_count: {LEXORA_TARGET_LEVEL_COUNT}")
    text = text.replace("target_level_count: 300", f"target_level_count: {LEXORA_TARGET_LEVEL_COUNT}")

    if "\n  ar:" in text:
        write(path, text)
        return

    text = replace_once(
        text,
        "  ko:\n    english_name: Korean",
        f'''  ar:
    english_name: Arabic
    native_name: العربية
    script: arabic
    active: true
    target_level_count: {LEXORA_TARGET_LEVEL_COUNT}
    min_wheel_letters: 4
    supports_accents: false
    case_policy: no_case
    min_word_length: 2
    max_word_length: 10
    alphabet: "ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأؤإئاةىًٌٍَُِّْ"
    allowed_extra_chars: ""
    normalize:
      lowercase: false
      strip_accents: false
      preserve_diacritics: true
      custom_i_policy: none
      arabic_policy: normalize_arabic_letters_reject_latin_digits_punctuation
    sources:
      kaikki_wiktionary:
        enabled: true
        dictionary_slug: Arabic
      hunspell:
        enabled: false
        dictionary_hint: none
      frequency_corpus:
        enabled: false
        required_for_gameplay_score: false
    gameplay:
      prefer_common_words: true
      compound_policy: arabic_morphology_review_required
      min_gameplay_score: 64
      review_rare_words: true

  ko:
    english_name: Korean''',
        "yaml ar block",
    )
    write(path, text)


def patch_required_languages_py(path: Path) -> None:
    text = read(path)
    old = 'REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko"]'
    new = 'REQUIRED_LANGUAGES = ["en", "es", "ru", "tr", "de", "pt", "it", "fr", "az", "hi", "zh", "ja", "ko", "ar"]'
    if old in text:
        text = text.replace(old, new, 1)
    write(path, text)


def main() -> int:
    patch_languages_ts()
    patch_translations_ts()
    patch_languages_yaml()
    patch_required_languages_py(FILES["init_db"])
    patch_required_languages_py(FILES["raw_downloader"])
    patch_required_languages_py(FILES["strict_downloader"])

    print("LEXORA_ARABIC_LANGUAGE_PATCH_OK")
    print("Added language code: ar")
    print("Added native name: العربية")
    print("Target levels per language:", LEXORA_TARGET_LEVEL_COUNT)
    print("Updated files:")
    for path in FILES.values():
        print("-", path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
