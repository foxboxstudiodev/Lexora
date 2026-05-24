import {
  isBeginnerAzerbaijaniWord,
  normalizeAzerbaijaniWord,
  REJECTED_AZERBAIJANI_WORDS,
} from '../i18n/azerbaijaniWordPolicy';
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
  az: new Set(Array.from(REJECTED_AZERBAIJANI_WORDS).map((word) => normalizeAzerbaijaniWord(word))),
};

function normalizeWord(word: string, language?: LanguageCode): string {
  if (language === 'az') return normalizeAzerbaijaniWord(word);
  return word.trim().toLocaleUpperCase();
}

export function isBannedWord(word: string, language: LanguageCode): boolean {
  return bannedWordsByLanguage[language]?.has(normalizeWord(word, language)) ?? false;
}

export function isAllowedMainWord(word: string, language: LanguageCode): boolean {
  const normalized = normalizeWord(word, language);
  if (!normalized) return false;
  if (isBannedWord(normalized, language)) return false;
  if (language === 'az') return isBeginnerAzerbaijaniWord(normalized);
  return true;
}

export function filterAllowedMainWords(words: string[], language: LanguageCode): string[] {
  return words.filter((word) => isAllowedMainWord(word, language));
}
