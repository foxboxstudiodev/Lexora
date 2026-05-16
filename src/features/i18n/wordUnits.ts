import { LanguageCode } from './languages';
import { getLanguageWordProfile } from './languageWordProfiles';

const DEVANAGARI_MARKS = /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963]/;
const DEVANAGARI_VIRAMA = '\u094D';

function stripLatinAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
}

export function normalizeWordForLanguage(value: string, language: LanguageCode): string {
  const profile = getLanguageWordProfile(language);
  const trimmed = value.trim();
  const accentNormalized = profile.accentPolicy === 'strip-for-matching' ? stripLatinAccents(trimmed) : trimmed;
  return accentNormalized.toLocaleUpperCase(language);
}

function segmentDevanagariGraphemes(value: string): string[] {
  const chars = Array.from(value);
  const units: string[] = [];

  for (const char of chars) {
    const previousIndex = units.length - 1;
    const previous = previousIndex >= 0 ? units[previousIndex] : '';

    if (previous && (DEVANAGARI_MARKS.test(char) || previous.endsWith(DEVANAGARI_VIRAMA))) {
      units[previousIndex] = `${previous}${char}`;
    } else {
      units.push(char);
    }
  }

  return units.filter(Boolean);
}

export function splitWordIntoUnits(value: string, language: LanguageCode): string[] {
  const profile = getLanguageWordProfile(language);
  const normalized = normalizeWordForLanguage(value, language);

  if (!normalized) return [];

  if (profile.segmentationMode === 'graphemes') {
    if (language === 'hi') return segmentDevanagariGraphemes(normalized);
    return Array.from(normalized);
  }

  if (profile.segmentationMode === 'characters' || profile.segmentationMode === 'syllable-blocks') {
    return Array.from(normalized);
  }

  return Array.from(normalized);
}

export function countWordUnits(value: string, language: LanguageCode): number {
  return splitWordIntoUnits(value, language).length;
}

export function isWordLengthAllowedForEarlyLevels(value: string, language: LanguageCode): boolean {
  const profile = getLanguageWordProfile(language);
  const count = countWordUnits(value, language);
  return count >= profile.minWordUnits && count <= profile.maxEarlyWordUnits;
}
