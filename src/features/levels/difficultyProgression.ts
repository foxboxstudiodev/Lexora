import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

export type ExpansionDifficultyBand = 'easy' | 'light-medium' | 'medium' | 'hard' | 'advanced';

export type DifficultyBandConfig = {
  band: ExpansionDifficultyBand;
  fromLevel: number;
  toLevel: number;
  minWheelLetters: number;
  maxWheelLetters: number;
  targetMainWords: number;
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

export const targetMainWordsByLevelInBlock = [
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  12,
  13,
  14,
  14,
  14,
  16,
  17,
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

export function getTargetMainWordCountForLevel(levelNumber: number): number {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  return targetMainWordsByLevelInBlock[getLevelInBlock(levelNumber) - 1];
}

function getBandForLevelInBlock(levelInBlock: number): ExpansionDifficultyBand {
  if (levelInBlock <= 4) return 'easy';
  if (levelInBlock <= 10) return 'light-medium';
  if (levelInBlock <= 14) return 'medium';
  if (levelInBlock <= 18) return 'hard';
  return 'advanced';
}

function getMinimumIntersections(targetMainWords: number): number {
  return Math.max(1, Math.min(targetMainWords - 1, Math.floor(targetMainWords * 0.55)));
}

export const difficultyBands: DifficultyBandConfig[] = Array.from({ length: DIFFICULTY_BLOCK_SIZE }, (_, index) => {
  const levelInBlock = index + 1;
  const wheelCount = wheelUnitsByLevelInBlock[index];
  const targetMainWords = targetMainWordsByLevelInBlock[index];

  return {
    band: getBandForLevelInBlock(levelInBlock),
    fromLevel: levelInBlock,
    toLevel: levelInBlock,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    targetMainWords,
    minMainWords: targetMainWords,
    maxMainWords: targetMainWords,
    minWordLength: 2,
    maxWordLength: wheelCount,
    minIntersections: getMinimumIntersections(targetMainWords),
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
  const targetMainWords = getTargetMainWordCountForLevel(levelNumber);

  return {
    band: getBandForLevelInBlock(levelInBlock),
    fromLevel: levelNumber,
    toLevel: levelNumber,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    targetMainWords,
    minMainWords: targetMainWords,
    maxMainWords: targetMainWords,
    minWordLength: 2,
    maxWordLength: wheelCount,
    minIntersections: getMinimumIntersections(targetMainWords),
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
