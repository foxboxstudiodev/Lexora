import { getJapaneseWordsForProgression, JAPANESE_KANJI_ONBOARDING_PROFILE } from './japaneseProgression';

export type JapaneseFrequencyBand = 1 | 2 | 3 | 4 | 5;

export type JapaneseFrequencyEntry = {
  word: string;
  band: JapaneseFrequencyBand;
  source: 'manual-core-frequency' | 'fallback-progression-order';
};

const MANUAL_FREQUENCY_BANDS: Record<string, JapaneseFrequencyBand> = {
  ひと: 1,
  ねこ: 1,
  いぬ: 1,
  やま: 1,
  かわ: 1,
  みず: 1,
  そら: 1,
  はな: 1,
  まち: 1,
  いえ: 1,
  ごはん: 1,
  ほん: 1,
  山: 1,
  川: 1,
  水: 1,
  人: 1,
  パン: 2,
  ゲーム: 2,
  コーヒー: 2,
  ホテル: 2,
  猫: 2,
  犬: 2,
};

export function getJapaneseFrequencyEntry(word: string): JapaneseFrequencyEntry {
  const normalized = word.trim();
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
    source: 'fallback-progression-order',
  };
}

export function sortJapaneseWordsByFrequency(words: string[]): string[] {
  return [...words].sort((left, right) => {
    const leftEntry = getJapaneseFrequencyEntry(left);
    const rightEntry = getJapaneseFrequencyEntry(right);
    if (leftEntry.band !== rightEntry.band) return leftEntry.band - rightEntry.band;
    return left.localeCompare(right, 'ja');
  });
}

export function getJapaneseFrequencyPool(maxBand: JapaneseFrequencyBand): JapaneseFrequencyEntry[] {
  return sortJapaneseWordsByFrequency(getJapaneseWordsForProgression(JAPANESE_KANJI_ONBOARDING_PROFILE))
    .map(getJapaneseFrequencyEntry)
    .filter((entry) => entry.band <= maxBand);
}
