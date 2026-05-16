export type ActiveLanguageCode = 'en' | 'es' | 'ru' | 'tr';
export type PlannedLanguageCode = 'de' | 'pt' | 'it' | 'fr' | 'az' | 'hi' | 'zh' | 'ja' | 'ko';
export type LanguageCode = ActiveLanguageCode | PlannedLanguageCode;

export type ScriptKind = 'latin' | 'cyrillic' | 'devanagari' | 'han' | 'kana' | 'hangul';
export type LanguageStatus = 'active' | 'planned';

export type LanguageDefinition = {
  code: LanguageCode;
  englishName: string;
  nativeName: string;
  script: ScriptKind;
  status: LanguageStatus;
  targetLevelCount: number;
  minWheelLetters: number;
  supportsAccents: boolean;
  notes: string;
};

export const TARGET_LEVELS_PER_LANGUAGE = 300;

export const ACTIVE_LANGUAGES: ActiveLanguageCode[] = ['en', 'es', 'ru', 'tr'];

export const PLANNED_LANGUAGES: PlannedLanguageCode[] = ['de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko'];

export const ALL_LANGUAGES: LanguageCode[] = [...ACTIVE_LANGUAGES, ...PLANNED_LANGUAGES];

export const languageRegistry: Record<LanguageCode, LanguageDefinition> = {
  en: { code: 'en', englishName: 'English', nativeName: 'English', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Current preview language.' },
  es: { code: 'es', englishName: 'Spanish', nativeName: 'Español', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Current preview language.' },
  ru: { code: 'ru', englishName: 'Russian', nativeName: 'Русский', script: 'cyrillic', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Current preview language.' },
  tr: { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Current preview language.' },
  de: { code: 'de', englishName: 'German', nativeName: 'Deutsch', script: 'latin', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Needs German dictionary and umlaut policy.' },
  pt: { code: 'pt', englishName: 'Portuguese', nativeName: 'Português', script: 'latin', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Needs Portuguese dictionary; BR/PT variant policy can be added later.' },
  it: { code: 'it', englishName: 'Italian', nativeName: 'Italiano', script: 'latin', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Needs Italian dictionary.' },
  fr: { code: 'fr', englishName: 'French', nativeName: 'Français', script: 'latin', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Needs French dictionary and accent handling policy.' },
  az: { code: 'az', englishName: 'Azerbaijani', nativeName: 'Azərbaycanca', script: 'latin', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: true, notes: 'Must support ə, ı, ö, ü, ç, ş, ğ.' },
  hi: { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Needs Devanagari grapheme/akshara segmentation.' },
  zh: { code: 'zh', englishName: 'Chinese', nativeName: '中文', script: 'han', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Use short 2-4 character words/terms.' },
  ja: { code: 'ja', englishName: 'Japanese', nativeName: '日本語', script: 'kana', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Start with hiragana/katakana. Kanji can come later.' },
  ko: { code: 'ko', englishName: 'Korean', nativeName: '한국어', script: 'hangul', status: 'planned', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters: 5, supportsAccents: false, notes: 'Use Hangul syllable blocks.' },
};

export function getActiveLanguageDefinitions(): LanguageDefinition[] {
  return ACTIVE_LANGUAGES.map((code) => languageRegistry[code]);
}

export function getPlannedLanguageDefinitions(): LanguageDefinition[] {
  return PLANNED_LANGUAGES.map((code) => languageRegistry[code]);
}
