import { getJapaneseFrequencyEntry } from './japaneseFrequency';
import { analyzeJapaneseWord } from './japaneseMorphology';
import {
  createJapaneseSpacedRepetitionState,
  isJapaneseReviewDue,
  JapaneseRecallQuality,
  JapaneseSpacedRepetitionState,
  reviewJapaneseSpacedRepetition,
} from './japaneseSpacedRepetition';

export type JapaneseProficiencyLevel = 'starter' | 'early' | 'core' | 'advanced';

export type JapaneseUserProficiencyMemory = {
  level: JapaneseProficiencyLevel;
  reviewedWords: Record<string, JapaneseSpacedRepetitionState>;
  correctStreak: number;
  weakWords: string[];
};

export type JapaneseAdaptiveRecommendation = {
  reviewNow: string[];
  introduceNext: string[];
  difficulty: JapaneseProficiencyLevel;
};

export function createJapaneseUserProficiencyMemory(level: JapaneseProficiencyLevel = 'starter'): JapaneseUserProficiencyMemory {
  return {
    level,
    reviewedWords: {},
    correctStreak: 0,
    weakWords: [],
  };
}

function nextLevel(level: JapaneseProficiencyLevel): JapaneseProficiencyLevel {
  if (level === 'starter') return 'early';
  if (level === 'early') return 'core';
  return 'advanced';
}

function previousLevel(level: JapaneseProficiencyLevel): JapaneseProficiencyLevel {
  if (level === 'advanced') return 'core';
  if (level === 'core') return 'early';
  return 'starter';
}

export function updateJapaneseProficiencyMemory(
  memory: JapaneseUserProficiencyMemory,
  word: string,
  quality: JapaneseRecallQuality,
  nowEpochMs = Date.now(),
): JapaneseUserProficiencyMemory {
  const existing = memory.reviewedWords[word] ?? createJapaneseSpacedRepetitionState(word, nowEpochMs);
  const reviewed = reviewJapaneseSpacedRepetition(existing, quality, nowEpochMs);
  const correctStreak = quality === 'again' ? 0 : memory.correctStreak + 1;
  const weakWords = quality === 'again'
    ? Array.from(new Set([...memory.weakWords, word]))
    : memory.weakWords.filter((item) => item !== word);

  const level = correctStreak >= 8
    ? nextLevel(memory.level)
    : weakWords.length >= 5
      ? previousLevel(memory.level)
      : memory.level;

  return {
    level,
    reviewedWords: {
      ...memory.reviewedWords,
      [word]: reviewed,
    },
    correctStreak,
    weakWords,
  };
}

export function recommendJapaneseAdaptiveSequence(
  memory: JapaneseUserProficiencyMemory,
  candidateWords: string[],
  nowEpochMs = Date.now(),
): JapaneseAdaptiveRecommendation {
  const reviewNow = Object.values(memory.reviewedWords)
    .filter((state) => isJapaneseReviewDue(state, nowEpochMs))
    .map((state) => state.word);

  const seen = new Set(Object.keys(memory.reviewedWords));
  const introduceNext = candidateWords
    .filter((word) => !seen.has(word))
    .sort((left, right) => {
      const leftFrequency = getJapaneseFrequencyEntry(left).band;
      const rightFrequency = getJapaneseFrequencyEntry(right).band;
      const leftKnown = analyzeJapaneseWord(left).lexicalClass === 'noun' ? 0 : 1;
      const rightKnown = analyzeJapaneseWord(right).lexicalClass === 'noun' ? 0 : 1;
      if (leftKnown !== rightKnown) return leftKnown - rightKnown;
      if (leftFrequency !== rightFrequency) return leftFrequency - rightFrequency;
      return left.localeCompare(right, 'ja');
    })
    .slice(0, 8);

  return {
    reviewNow,
    introduceNext,
    difficulty: memory.level,
  };
}
