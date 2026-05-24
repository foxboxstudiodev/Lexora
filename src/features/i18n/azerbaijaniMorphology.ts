import { getAzerbaijaniFrequencyEntry } from './azerbaijaniFrequency';
import { getAzerbaijaniSemanticGroup } from './azerbaijaniSemanticDuplicates';
import { isBeginnerAzerbaijaniWord, normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniMorphologyToken = {
  surface: string;
  normalized: string;
  lexicalClass: 'noun' | 'unknown';
  semanticGroupId?: string;
  frequencyBand: 1 | 2 | 3 | 4 | 5;
  isBeginnerSafe: boolean;
};

const CORE_NOUNS = new Set([
  'ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'dəftər', 'qələm', 'pəncərə', 'divar',
  'su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'çiçək', 'hava',
  'ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'ailə', 'dost',
  'çörək', 'ət', 'süd', 'duz', 'bal', 'pendir', 'yumurta', 'alma', 'balıq', 'plov',
  'yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'bank',
]);

export function analyzeAzerbaijaniWord(surface: string): AzerbaijaniMorphologyToken {
  const normalized = normalizeAzerbaijaniWord(surface);
  const semanticGroup = getAzerbaijaniSemanticGroup(normalized);
  const frequency = getAzerbaijaniFrequencyEntry(normalized);
  const isBeginnerSafe = isBeginnerAzerbaijaniWord(normalized);

  return {
    surface: surface.trim(),
    normalized,
    lexicalClass: CORE_NOUNS.has(normalized) || semanticGroup ? 'noun' : 'unknown',
    semanticGroupId: semanticGroup?.id,
    frequencyBand: frequency.band,
    isBeginnerSafe,
  };
}

export function analyzeAzerbaijaniWords(words: string[]): AzerbaijaniMorphologyToken[] {
  return words.map(analyzeAzerbaijaniWord);
}

export function isKnownAzerbaijaniNoun(surface: string): boolean {
  return analyzeAzerbaijaniWord(surface).lexicalClass === 'noun';
}

export function getKnownAzerbaijaniNouns(words: string[]): string[] {
  return analyzeAzerbaijaniWords(words)
    .filter((token) => token.lexicalClass === 'noun')
    .map((token) => token.normalized);
}
