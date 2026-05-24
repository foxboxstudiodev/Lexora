import { JapaneseProgressionProfile } from './japaneseProgression';
import {
  getJapaneseKanjiDifficultyPool,
  JapaneseKanjiDifficulty,
  JapaneseKanjiDifficultyTier,
} from './japaneseKanjiDifficulty';

export type JapaneseKanjiUnlockStage = 'locked' | 'starter' | 'basic' | 'intermediate';

export type JapaneseKanjiUnlockResult = {
  stage: JapaneseKanjiUnlockStage;
  unlocked: JapaneseKanjiDifficulty[];
};

function resolveKanjiTier(profile: JapaneseProgressionProfile): JapaneseKanjiDifficultyTier | null {
  if (!profile.allowedScripts.includes('kanji-assisted') && !profile.allowedScripts.includes('kanji-primary')) {
    return null;
  }

  if (profile.maxFrequencyBand <= 1) return 'starter';
  if (profile.maxFrequencyBand <= 3) return 'basic';
  return 'intermediate';
}

export function getJapaneseKanjiUnlocks(profile: JapaneseProgressionProfile): JapaneseKanjiUnlockResult {
  const tier = resolveKanjiTier(profile);

  if (!tier) {
    return {
      stage: 'locked',
      unlocked: [],
    };
  }

  return {
    stage: tier,
    unlocked: getJapaneseKanjiDifficultyPool(tier),
  };
}

export function isJapaneseKanjiUnlocked(profile: JapaneseProgressionProfile, kanji: string): boolean {
  return getJapaneseKanjiUnlocks(profile).unlocked.some((item) => item.kanji === kanji.trim());
}
