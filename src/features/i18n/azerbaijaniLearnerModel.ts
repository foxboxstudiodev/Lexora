import { getAzerbaijaniWordsForProgression, AzerbaijaniProgressionProfile } from './azerbaijaniAdaptiveProgression';
import { getAzerbaijaniUsageContext } from './azerbaijaniUsageContext';
import {
  AzerbaijaniRecallQuality,
  AzerbaijaniSpacedRepetitionState,
  createAzerbaijaniSpacedRepetitionState,
  isAzerbaijaniReviewDue,
  reviewAzerbaijaniSpacedRepetition,
} from './azerbaijaniSpacedRepetition';

export type AzerbaijaniLearnerLevel = 'starter' | 'early' | 'core' | 'advanced';

export type AzerbaijaniLearnerMemory = {
  level: AzerbaijaniLearnerLevel;
  reviewedWords: Record<string, AzerbaijaniSpacedRepetitionState>;
  weakWords: string[];
  masteredWords: string[];
  contextExposure: Record<string, number>;
  correctStreak: number;
};

export type AzerbaijaniLearnerRecommendation = {
  reviewNow: string[];
  introduceNext: string[];
  level: AzerbaijaniLearnerLevel;
  weakestContexts: string[];
};

export function createAzerbaijaniLearnerMemory(level: AzerbaijaniLearnerLevel = 'starter'): AzerbaijaniLearnerMemory {
  return {
    level,
    reviewedWords: {},
    weakWords: [],
    masteredWords: [],
    contextExposure: {},
    correctStreak: 0,
  };
}

function promoteLevel(level: AzerbaijaniLearnerLevel): AzerbaijaniLearnerLevel {
  if (level === 'starter') return 'early';
  if (level === 'early') return 'core';
  if (level === 'core') return 'advanced';
  return 'advanced';
}

function demoteLevel(level: AzerbaijaniLearnerLevel): AzerbaijaniLearnerLevel {
  if (level === 'advanced') return 'core';
  if (level === 'core') return 'early';
  return 'starter';
}

function updateUniqueList(values: string[], word: string, include: boolean): string[] {
  const filtered = values.filter((item) => item !== word);
  return include ? [...filtered, word] : filtered;
}

export function updateAzerbaijaniLearnerMemory(
  memory: AzerbaijaniLearnerMemory,
  word: string,
  quality: AzerbaijaniRecallQuality,
  nowEpochMs = Date.now(),
): AzerbaijaniLearnerMemory {
  const normalizedWord = word.trim().toLocaleLowerCase('az-AZ');
  const existing = memory.reviewedWords[normalizedWord] ?? createAzerbaijaniSpacedRepetitionState(normalizedWord, nowEpochMs);
  const reviewed = reviewAzerbaijaniSpacedRepetition(existing, quality, nowEpochMs);
  const context = getAzerbaijaniUsageContext(normalizedWord);
  const correctStreak = quality === 'again' ? 0 : memory.correctStreak + 1;
  const weakWords = updateUniqueList(memory.weakWords, normalizedWord, quality === 'again' || quality === 'hard');
  const masteredWords = updateUniqueList(memory.masteredWords, normalizedWord, quality === 'easy' && reviewed.repetitions >= 3);
  const level = correctStreak >= 10
    ? promoteLevel(memory.level)
    : weakWords.length >= 6
      ? demoteLevel(memory.level)
      : memory.level;

  return {
    level,
    reviewedWords: {
      ...memory.reviewedWords,
      [normalizedWord]: reviewed,
    },
    weakWords,
    masteredWords,
    contextExposure: {
      ...memory.contextExposure,
      [context]: (memory.contextExposure[context] ?? 0) + 1,
    },
    correctStreak,
  };
}

function getWeakestContexts(memory: AzerbaijaniLearnerMemory): string[] {
  const knownContexts = ['home', 'nature', 'family', 'food', 'city', 'school', 'body'];
  return knownContexts
    .sort((left, right) => (memory.contextExposure[left] ?? 0) - (memory.contextExposure[right] ?? 0))
    .slice(0, 3);
}

export function recommendAzerbaijaniLearnerSequence(
  memory: AzerbaijaniLearnerMemory,
  candidateWords: string[],
  profile: AzerbaijaniProgressionProfile,
  nowEpochMs = Date.now(),
): AzerbaijaniLearnerRecommendation {
  const reviewNow = Object.values(memory.reviewedWords)
    .filter((state) => isAzerbaijaniReviewDue(state, nowEpochMs))
    .map((state) => state.word);
  const seen = new Set([...Object.keys(memory.reviewedWords), ...memory.masteredWords]);
  const weakestContexts = getWeakestContexts(memory);
  const progressionWords = getAzerbaijaniWordsForProgression(candidateWords, profile);

  const introduceNext = progressionWords
    .filter((word) => !seen.has(word))
    .sort((left, right) => {
      const leftContextPriority = weakestContexts.includes(getAzerbaijaniUsageContext(left)) ? 0 : 1;
      const rightContextPriority = weakestContexts.includes(getAzerbaijaniUsageContext(right)) ? 0 : 1;
      if (leftContextPriority !== rightContextPriority) return leftContextPriority - rightContextPriority;
      return left.localeCompare(right, 'az');
    })
    .slice(0, 8);

  return {
    reviewNow,
    introduceNext,
    level: memory.level,
    weakestContexts,
  };
}
