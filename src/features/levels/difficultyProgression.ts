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
  blockIndex: number;
  levelInBlock: number;
};

export const FULL_PACK_LEVEL_COUNT = 300;
export const DIFFICULTY_BLOCK_SIZE = 20;
export const DIFFICULTY_BLOCK_COUNT = FULL_PACK_LEVEL_COUNT / DIFFICULTY_BLOCK_SIZE;

export const wheelUnitsByLevelInBlock = [
  4,
  4,
  5,
  5,
  5,
  5,
  6,
  6,
  6,
  6,
  7,
  7,
  7,
  7,
  8,
  8,
  8,
  9,
  9,
  10,
] as const;

function getLevelInBlock(levelNumber: number): number {
  return ((levelNumber - 1) % DIFFICULTY_BLOCK_SIZE) + 1;
}

function getBlockIndex(levelNumber: number): number {
  return Math.floor((levelNumber - 1) / DIFFICULTY_BLOCK_SIZE) + 1;
}

export function getWheelUnitCountForLevel(levelNumber: number): number {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  const count = wheelUnitsByLevelInBlock[getLevelInBlock(levelNumber) - 1];
  return Math.min(MAX_WHEEL_UNITS, Math.max(MIN_WHEEL_UNITS, count));
}

function getBandForLevelInBlock(levelInBlock: number): ExpansionDifficultyBand {
  if (levelInBlock <= 4) return 'easy';
  if (levelInBlock <= 10) return 'light-medium';
  if (levelInBlock <= 14) return 'medium';
  if (levelInBlock <= 18) return 'hard';
  return 'advanced';
}

function getWordTargetForWheelCount(wheelCount: number): { minMainWords: number; maxMainWords: number; minIntersections: number } {
  if (wheelCount <= 4) return { minMainWords: 2, maxMainWords: 3, minIntersections: 1 };
  if (wheelCount <= 5) return { minMainWords: 2, maxMainWords: 4, minIntersections: 1 };
  if (wheelCount <= 6) return { minMainWords: 3, maxMainWords: 5, minIntersections: 1 };
  if (wheelCount <= 7) return { minMainWords: 4, maxMainWords: 6, minIntersections: 2 };
  if (wheelCount <= 8) return { minMainWords: 5, maxMainWords: 7, minIntersections: 2 };
  if (wheelCount <= 9) return { minMainWords: 5, maxMainWords: 8, minIntersections: 2 };
  return { minMainWords: 6, maxMainWords: 9, minIntersections: 3 };
}

export const difficultyBands: DifficultyBandConfig[] = Array.from({ length: DIFFICULTY_BLOCK_SIZE }, (_, index) => {
  const levelInBlock = index + 1;
  const wheelCount = wheelUnitsByLevelInBlock[index];
  const wordTarget = getWordTargetForWheelCount(wheelCount);

  return {
    band: getBandForLevelInBlock(levelInBlock),
    fromLevel: levelInBlock,
    toLevel: levelInBlock,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    minMainWords: wordTarget.minMainWords,
    maxMainWords: wordTarget.maxMainWords,
    minWordLength: Math.max(2, Math.min(wheelCount, Math.floor(wheelCount / 2) + 1)),
    maxWordLength: wheelCount,
    minIntersections: wordTarget.minIntersections,
    blockIndex: 1,
    levelInBlock,
  };
});

export function getDifficultyBandForLevel(levelNumber: number): DifficultyBandConfig {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  const levelInBlock = getLevelInBlock(levelNumber);
  const wheelCount = getWheelUnitCountForLevel(levelNumber);
  const wordTarget = getWordTargetForWheelCount(wheelCount);

  return {
    band: getBandForLevelInBlock(levelInBlock),
    fromLevel: levelNumber,
    toLevel: levelNumber,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    minMainWords: wordTarget.minMainWords,
    maxMainWords: wordTarget.maxMainWords,
    minWordLength: Math.max(2, Math.min(wheelCount, Math.floor(wheelCount / 2) + 1)),
    maxWordLength: wheelCount,
    minIntersections: wordTarget.minIntersections,
    blockIndex: getBlockIndex(levelNumber),
    levelInBlock,
  };
}

export function getExpansionDifficultyName(levelNumber: number): ExpansionDifficultyBand {
  return getDifficultyBandForLevel(levelNumber).band;
}

export function isValidFullPackLevelNumber(levelNumber: number): boolean {
  return Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= FULL_PACK_LEVEL_COUNT;
}
