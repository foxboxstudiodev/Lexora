import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

export type ExpansionDifficultyBand = 'easy' | 'light-medium' | 'medium' | 'hard' | 'advanced';

export type DifficultyBandConfig = {
  band: ExpansionDifficultyBand;
  fromLevel: number;
  toLevel: number;
  minWheelLetters: number;
  maxWheelLetters: number;
  minMainWords: number;
  maxMainWords: number;
  minWordLength: number;
  maxWordLength: number;
  minIntersections: number;
};

export const FULL_PACK_LEVEL_COUNT = 300;

export const difficultyBands: DifficultyBandConfig[] = [
  {
    band: 'easy',
    fromLevel: 1,
    toLevel: 50,
    minWheelLetters: MIN_WHEEL_UNITS,
    maxWheelLetters: 5,
    minMainWords: 2,
    maxMainWords: 4,
    minWordLength: 3,
    maxWordLength: 5,
    minIntersections: 1,
  },
  {
    band: 'light-medium',
    fromLevel: 51,
    toLevel: 120,
    minWheelLetters: 5,
    maxWheelLetters: 6,
    minMainWords: 3,
    maxMainWords: 5,
    minWordLength: 3,
    maxWordLength: 6,
    minIntersections: 1,
  },
  {
    band: 'medium',
    fromLevel: 121,
    toLevel: 200,
    minWheelLetters: 6,
    maxWheelLetters: 7,
    minMainWords: 4,
    maxMainWords: 6,
    minWordLength: 4,
    maxWordLength: 7,
    minIntersections: 2,
  },
  {
    band: 'hard',
    fromLevel: 201,
    toLevel: 260,
    minWheelLetters: 7,
    maxWheelLetters: 8,
    minMainWords: 5,
    maxMainWords: 7,
    minWordLength: 4,
    maxWordLength: 8,
    minIntersections: 2,
  },
  {
    band: 'advanced',
    fromLevel: 261,
    toLevel: 300,
    minWheelLetters: 8,
    maxWheelLetters: MAX_WHEEL_UNITS,
    minMainWords: 6,
    maxMainWords: 9,
    minWordLength: 5,
    maxWordLength: 10,
    minIntersections: 3,
  },
];

export function getDifficultyBandForLevel(levelNumber: number): DifficultyBandConfig {
  const band = difficultyBands.find((item) => levelNumber >= item.fromLevel && levelNumber <= item.toLevel);

  if (!band) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  return band;
}

export function getExpansionDifficultyName(levelNumber: number): ExpansionDifficultyBand {
  return getDifficultyBandForLevel(levelNumber).band;
}

export function isValidFullPackLevelNumber(levelNumber: number): boolean {
  return Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= FULL_PACK_LEVEL_COUNT;
}
