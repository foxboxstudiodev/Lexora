import { getAzerbaijaniFrequencyEntry } from './azerbaijaniFrequency';
import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniUsageContext =
  | 'home'
  | 'nature'
  | 'family'
  | 'food'
  | 'city'
  | 'school'
  | 'body'
  | 'general';

export type AzerbaijaniUsageContextEntry = {
  word: string;
  context: AzerbaijaniUsageContext;
  frequencyBand: 1 | 2 | 3 | 4 | 5;
};

const CONTEXT_WORDS: Record<AzerbaijaniUsageContext, string[]> = {
  home: ['ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'dəftər', 'qələm', 'pəncərə', 'divar', 'mənzil', 'mətbəx', 'hamam', 'yataq'],
  nature: ['su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'çiçək', 'hava', 'göl', 'sahil', 'yağış', 'qar'],
  family: ['ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'ailə', 'dost', 'nənə', 'baba'],
  food: ['çörək', 'ət', 'süd', 'duz', 'bal', 'pendir', 'yumurta', 'alma', 'balıq', 'plov', 'lavaş', 'dolma'],
  city: ['yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'bank', 'bina', 'körpü'],
  school: ['məktəb', 'sinif', 'dərs', 'kitab', 'dəftər', 'qələm', 'lövhə', 'müəllim', 'şagird', 'imtahan'],
  body: ['baş', 'göz', 'qulaq', 'burun', 'ağız', 'diş', 'dil', 'əl', 'ayaq', 'barmaq', 'ürək', 'beyin'],
  general: [],
};

export function getAzerbaijaniUsageContext(word: string): AzerbaijaniUsageContext {
  const normalized = normalizeAzerbaijaniWord(word);

  for (const [context, words] of Object.entries(CONTEXT_WORDS) as Array<[AzerbaijaniUsageContext, string[]]>) {
    if (words.map(normalizeAzerbaijaniWord).includes(normalized)) return context;
  }

  return 'general';
}

export function getAzerbaijaniUsageContextEntry(word: string): AzerbaijaniUsageContextEntry {
  const normalized = normalizeAzerbaijaniWord(word);
  return {
    word: normalized,
    context: getAzerbaijaniUsageContext(normalized),
    frequencyBand: getAzerbaijaniFrequencyEntry(normalized).band,
  };
}

export function groupAzerbaijaniWordsByUsageContext(words: string[]): Record<AzerbaijaniUsageContext, string[]> {
  const grouped: Record<AzerbaijaniUsageContext, string[]> = {
    home: [],
    nature: [],
    family: [],
    food: [],
    city: [],
    school: [],
    body: [],
    general: [],
  };

  for (const word of words) {
    const normalized = normalizeAzerbaijaniWord(word);
    grouped[getAzerbaijaniUsageContext(normalized)].push(normalized);
  }

  return grouped;
}
