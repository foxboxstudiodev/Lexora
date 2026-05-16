import { LanguageCode } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';

export type UnitWord = {
  raw: string;
  units: string[];
  normalized: string;
};

export function toUnitWord(raw: string, language: LanguageCode): UnitWord {
  const units = splitWordIntoUnits(raw, language);
  return {
    raw,
    units,
    normalized: units.join(''),
  };
}

export function toUnitWords(words: string[], language: LanguageCode): UnitWord[] {
  const seen = new Set<string>();
  const result: UnitWord[] = [];

  for (const word of words) {
    const unitWord = toUnitWord(word, language);
    if (!unitWord.normalized || seen.has(unitWord.normalized)) continue;
    seen.add(unitWord.normalized);
    result.push(unitWord);
  }

  return result;
}

export function unitWordsToStrings(words: UnitWord[]): string[] {
  return words.map((word) => word.normalized);
}
