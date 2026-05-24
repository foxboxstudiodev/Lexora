import { getAzerbaijaniFrequencyEntry } from './azerbaijaniFrequency';
import { analyzeAzerbaijaniWord } from './azerbaijaniMorphology';
import { getAzerbaijaniSemanticGroup } from './azerbaijaniSemanticDuplicates';
import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniDictionaryEntry = {
  surface: string;
  lemma: string;
  lexicalClass: 'noun' | 'unknown';
  meaningHint: string;
  semanticGroupId?: string;
  frequencyBand: 1 | 2 | 3 | 4 | 5;
  source: 'local-azerbaijani-core-dictionary' | 'local-semantic-fallback';
};

const CORE_DICTIONARY: Record<string, string> = {
  ev: 'house, home',
  otaq: 'room',
  qapı: 'door',
  masa: 'table',
  stul: 'chair',
  kitab: 'book',
  dəftər: 'notebook',
  qələm: 'pen',
  su: 'water',
  gün: 'day, sun',
  ay: 'moon, month',
  dağ: 'mountain',
  çay: 'river, tea',
  dəniz: 'sea',
  meşə: 'forest',
  ağac: 'tree',
  ana: 'mother',
  ata: 'father',
  uşaq: 'child',
  adam: 'person',
  ailə: 'family',
  dost: 'friend',
  çörək: 'bread',
  süd: 'milk',
  balıq: 'fish',
  yol: 'road, way',
  məktəb: 'school',
  bazar: 'market',
  maşın: 'car',
  şəhər: 'city',
  kənd: 'village',
};

export function lookupAzerbaijaniDictionaryEntry(surface: string): AzerbaijaniDictionaryEntry | null {
  const lemma = normalizeAzerbaijaniWord(surface);
  if (!lemma) return null;

  const morphology = analyzeAzerbaijaniWord(lemma);
  const semanticGroup = getAzerbaijaniSemanticGroup(lemma);
  const frequency = getAzerbaijaniFrequencyEntry(lemma);
  const meaningHint = CORE_DICTIONARY[lemma];

  if (!meaningHint && morphology.lexicalClass === 'unknown') return null;

  return {
    surface: surface.trim(),
    lemma,
    lexicalClass: morphology.lexicalClass,
    meaningHint: meaningHint ?? semanticGroup?.canonical ?? lemma,
    semanticGroupId: semanticGroup?.id,
    frequencyBand: frequency.band,
    source: meaningHint ? 'local-azerbaijani-core-dictionary' : 'local-semantic-fallback',
  };
}

export function lookupAzerbaijaniDictionaryEntries(words: string[]): AzerbaijaniDictionaryEntry[] {
  return words
    .map(lookupAzerbaijaniDictionaryEntry)
    .filter((entry): entry is AzerbaijaniDictionaryEntry => entry !== null);
}

export function isAzerbaijaniDictionaryKnownWord(surface: string): boolean {
  return lookupAzerbaijaniDictionaryEntry(surface) !== null;
}
