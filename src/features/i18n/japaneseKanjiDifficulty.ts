import { japaneseKanjiSeeds } from './japaneseKanjiSeeds';

export type JapaneseKanjiDifficultyTier = 'starter' | 'basic' | 'intermediate';

export type JapaneseKanjiDifficulty = {
  kanji: string;
  reading: string;
  tier: JapaneseKanjiDifficultyTier;
  score: number;
};

const difficultyTable: JapaneseKanjiDifficulty[] = japaneseKanjiSeeds.map((seed, index) => ({
  kanji: seed.kanji,
  reading: seed.kanaReading,
  tier:
    seed.gradeHint === 'starter-kanji'
      ? 'starter'
      : seed.gradeHint === 'early-kanji'
        ? 'basic'
        : 'intermediate',
  score: index + 1,
}));

export function getJapaneseKanjiDifficulty(kanji: string): JapaneseKanjiDifficulty | null {
  return difficultyTable.find((item) => item.kanji === kanji.trim()) ?? null;
}

export function getJapaneseKanjiDifficultyPool(maxTier: JapaneseKanjiDifficultyTier): JapaneseKanjiDifficulty[] {
  const order: JapaneseKanjiDifficultyTier[] = ['starter', 'basic', 'intermediate'];
  const limit = order.indexOf(maxTier);

  return difficultyTable.filter((item) => order.indexOf(item.tier) <= limit);
}
