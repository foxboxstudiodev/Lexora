import { LanguageCode } from '../i18n/translations';
import { normalizeWord } from '../game/engine';

const allowedLetters: Record<LanguageCode, RegExp> = {
  en: /^[A-Z]+$/,
  es: /^[A-ZÑ]+$/,
  ru: /^[А-ЯЁ]+$/,
  tr: /^[A-ZÇĞİÖŞÜ]+$/,
  de: /^[A-ZÄÖÜẞ]+$/,
  pt: /^[A-ZÁÂÃÀÇÉÊÍÓÔÕÚÜ]+$/,
  it: /^[A-ZÀÈÉÌÍÎÒÓÙÚ]+$/,
  fr: /^[A-ZÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ]+$/,
  az: /^[A-ZÇƏĞIİÖŞÜ]+$/,
  hi: /^[\u0900-\u097F]+$/,
  zh: /^[\u3400-\u9FFF]+$/,
  ja: /^[\u3040-\u30FF\u3400-\u9FFFー]+$/,
  ko: /^[\uAC00-\uD7AF]+$/,
  ar: /^[\u0600-\u06FF]+$/,
};

export function normalizeDictionaryWord(word: string, language: LanguageCode): string {
  const upper = normalizeWord(word);
  if (language === 'es') {
    return upper
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Ü/g, 'U');
  }
  return upper;
}

export function isAllowedWordShape(word: string, language: LanguageCode): boolean {
  const normalized = normalizeDictionaryWord(word, language);
  if (normalized.length < 2 || normalized.length > 12) return false;
  return allowedLetters[language].test(normalized);
}

export function createDictionary(words: string[], language: LanguageCode): Set<string> {
  return new Set(
    words
      .map((word) => normalizeDictionaryWord(word, language))
      .filter((word) => isAllowedWordShape(word, language)),
  );
}

export function hasWord(dictionary: Set<string>, word: string, language: LanguageCode): boolean {
  return dictionary.has(normalizeDictionaryWord(word, language));
}
