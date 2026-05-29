import { LEXORA_LEVELS_PER_LANGUAGE } from '../structure/lexoraStructure';

export type ActiveLanguageCode = 'en' | 'es' | 'ru' | 'tr' | 'de' | 'pt' | 'it' | 'fr' | 'az' | 'hi' | 'zh' | 'ja' | 'ko' | 'ar';
export type LanguageCode = ActiveLanguageCode;

export type ScriptKind = 'latin' | 'cyrillic' | 'devanagari' | 'han' | 'kana' | 'hangul' | 'arabic';
export type LanguageStatus = 'active';

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

export const TARGET_LEVELS_PER_LANGUAGE = LEXORA_LEVELS_PER_LANGUAGE;
export const GLOBAL_MIN_WHEEL_LETTERS = 4;

export const ACTIVE_LANGUAGES: ActiveLanguageCode[] = ['en', 'es', 'ru', 'tr', 'de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko', 'ar'];
export const ALL_LANGUAGES: LanguageCode[] = [...ACTIVE_LANGUAGES];

const playableNote = 'Playable 1000-level full-pack language.';
const minWheelLetters = GLOBAL_MIN_WHEEL_LETTERS;

export const languageRegistry: Record<LanguageCode, LanguageDefinition> = {
  en: { code: 'en', englishName: 'English', nativeName: 'English', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  es: { code: 'es', englishName: 'Spanish', nativeName: 'Español', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  ru: { code: 'ru', englishName: 'Russian', nativeName: 'Русский', script: 'cyrillic', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  tr: { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  de: { code: 'de', englishName: 'German', nativeName: 'Deutsch', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  pt: { code: 'pt', englishName: 'Portuguese', nativeName: 'Português', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  it: { code: 'it', englishName: 'Italian', nativeName: 'Italiano', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  fr: { code: 'fr', englishName: 'French', nativeName: 'Français', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  az: { code: 'az', englishName: 'Azerbaijani', nativeName: 'Azərbaycanca', script: 'latin', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: true, notes: playableNote },
  hi: { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  zh: { code: 'zh', englishName: 'Chinese', nativeName: '中文', script: 'han', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  ja: { code: 'ja', englishName: 'Japanese', nativeName: '日本語', script: 'kana', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  ko: { code: 'ko', englishName: 'Korean', nativeName: '한국어', script: 'hangul', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
  ar: { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', script: 'arabic', status: 'active', targetLevelCount: TARGET_LEVELS_PER_LANGUAGE, minWheelLetters, supportsAccents: false, notes: playableNote },
};

export function isActiveLanguageCode(code: string): code is ActiveLanguageCode {
  return ACTIVE_LANGUAGES.includes(code as ActiveLanguageCode);
}

export function getActiveLanguageDefinitions(): LanguageDefinition[] {
  return ACTIVE_LANGUAGES.map((code) => languageRegistry[code]);
}
