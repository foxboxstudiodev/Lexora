import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniFrequencyBand = 1 | 2 | 3 | 4 | 5;

export type AzerbaijaniFrequencyEntry = {
  word: string;
  band: AzerbaijaniFrequencyBand;
  source: 'manual-core-frequency' | 'fallback-content-order';
};

const MANUAL_FREQUENCY_BANDS: Record<string, AzerbaijaniFrequencyBand> = {
  ev: 1,
  su: 1,
  gün: 1,
  yol: 1,
  ana: 1,
  ata: 1,
  uşaq: 1,
  adam: 1,
  kitab: 1,
  qapı: 1,
  otaq: 1,
  masa: 1,
  şəhər: 1,
  kənd: 1,
  məktəb: 1,
  çörək: 1,
  süd: 1,
  dağ: 2,
  çay: 2,
  dəniz: 2,
  meşə: 2,
  ağac: 2,
  maşın: 2,
  bazar: 2,
  ailə: 2,
  dost: 2,
  qardaş: 2,
  bacı: 2,
  alma: 2,
  balıq: 2,
};

export function getAzerbaijaniFrequencyEntry(word: string): AzerbaijaniFrequencyEntry {
  const normalized = normalizeAzerbaijaniWord(word);
  const manualBand = MANUAL_FREQUENCY_BANDS[normalized];

  if (manualBand) {
    return {
      word: normalized,
      band: manualBand,
      source: 'manual-core-frequency',
    };
  }

  return {
    word: normalized,
    band: 3,
    source: 'fallback-content-order',
  };
}

export function sortAzerbaijaniWordsByFrequency(words: string[]): string[] {
  return [...words].sort((left, right) => {
    const leftEntry = getAzerbaijaniFrequencyEntry(left);
    const rightEntry = getAzerbaijaniFrequencyEntry(right);
    if (leftEntry.band !== rightEntry.band) return leftEntry.band - rightEntry.band;
    return leftEntry.word.localeCompare(rightEntry.word, 'az');
  });
}

export function getAzerbaijaniFrequencyPool(words: string[], maxBand: AzerbaijaniFrequencyBand): AzerbaijaniFrequencyEntry[] {
  return sortAzerbaijaniWordsByFrequency(words)
    .map(getAzerbaijaniFrequencyEntry)
    .filter((entry) => entry.band <= maxBand);
}
