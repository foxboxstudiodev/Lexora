import { getAzerbaijaniFrequencyEntry, sortAzerbaijaniWordsByFrequency } from './azerbaijaniFrequency';
import { removeAzerbaijaniSemanticDuplicates } from './azerbaijaniSemanticDuplicates';
import { isBeginnerAzerbaijaniWord, normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniLearnerStage = 'starter' | 'early' | 'core' | 'advanced';

export type AzerbaijaniProgressionProfile = {
  stage: AzerbaijaniLearnerStage;
  maxFrequencyBand: 1 | 2 | 3 | 4 | 5;
  maxWordLength: number;
  allowSemanticDuplicates: boolean;
};

export const AZERBAIJANI_STARTER_PROFILE: AzerbaijaniProgressionProfile = {
  stage: 'starter',
  maxFrequencyBand: 1,
  maxWordLength: 6,
  allowSemanticDuplicates: false,
};

export const AZERBAIJANI_CORE_PROFILE: AzerbaijaniProgressionProfile = {
  stage: 'core',
  maxFrequencyBand: 3,
  maxWordLength: 12,
  allowSemanticDuplicates: false,
};

export function getAzerbaijaniWordsForProgression(words: string[], profile: AzerbaijaniProgressionProfile): string[] {
  const filtered = words
    .map(normalizeAzerbaijaniWord)
    .filter((word) => isBeginnerAzerbaijaniWord(word))
    .filter((word) => getAzerbaijaniFrequencyEntry(word).band <= profile.maxFrequencyBand)
    .filter((word) => word.length <= profile.maxWordLength);

  const unique = Array.from(new Set(filtered));
  const diverse = profile.allowSemanticDuplicates ? unique : removeAzerbaijaniSemanticDuplicates(unique);

  return sortAzerbaijaniWordsByFrequency(diverse);
}

export function getNextAzerbaijaniLearnerStage(stage: AzerbaijaniLearnerStage): AzerbaijaniLearnerStage {
  if (stage === 'starter') return 'early';
  if (stage === 'early') return 'core';
  if (stage === 'core') return 'advanced';
  return 'advanced';
}
