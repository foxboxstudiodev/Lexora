import { LanguageCode } from '../i18n/languages';

const bannedWordsByLanguage: Partial<Record<LanguageCode, Set<string>>> = {
  ru: new Set([
    'АД',
    'ВОД',
    'ВЕТ',
    'ЕС',
    'КОН',
    'МОДА',
    'НОРЫ',
    'РАД',
    'СЕТ',
  ]),
};

function normalizeWord(word: string): string {
  return word.trim().toLocaleUpperCase();
}

export function isBannedWord(word: string, language: LanguageCode): boolean {
  return bannedWordsByLanguage[language]?.has(normalizeWord(word)) ?? false;
}

export function isAllowedMainWord(word: string, language: LanguageCode): boolean {
  const normalized = normalizeWord(word);
  if (!normalized) return false;
  if (isBannedWord(normalized, language)) return false;
  return true;
}

export function filterAllowedMainWords(words: string[], language: LanguageCode): string[] {
  return words.filter((word) => isAllowedMainWord(word, language));
}
