import {
  getDifficultyLayerForLevel,
  getLevelInWorldBlock,
  getWorldBlockIndex,
  isValidLexoraLevelNumber,
  LEXORA_LEVELS_PER_LANGUAGE,
  LEXORA_LEVELS_PER_WORLD_BLOCK,
  LEXORA_WORLD_BLOCK_COUNT,
} from '../structure/lexoraStructure';
import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

export type ExpansionDifficultyBand = 'easy' | 'medium' | 'hard' | 'very-hard';

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

export const FULL_PACK_LEVEL_COUNT = LEXORA_LEVELS_PER_LANGUAGE;
export const DIFFICULTY_BLOCK_SIZE = LEXORA_LEVELS_PER_WORLD_BLOCK;
export const DIFFICULTY_BLOCK_COUNT = LEXORA_WORLD_BLOCK_COUNT;

const easyWheelUnits = [4, 4, 4, 4, 5, 5, 5, 5, 5, 5] as const;
const mediumWheelUnits = [5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7] as const;
const hardWheelUnits = [7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9] as const;
const veryHardWheelUnits = [9, 9, 9, 10, 10, 10, 10, 10, 10, 10] as const;

const easyMainWords = [2, 3, 3, 4, 4, 5, 5, 6, 6, 7] as const;
const mediumMainWords = [7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14] as const;
const hardMainWords = [14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21] as const;
const veryHardMainWords = [21, 22, 22, 23, 23, 24, 24, 25, 25, 26] as const;

export const wheelUnitsByLevelInBlock = [
  ...easyWheelUnits,
  ...mediumWheelUnits,
  ...hardWheelUnits,
  ...veryHardWheelUnits,
] as const;

export const targetMainWordsByLevelInBlock = [
  ...easyMainWords,
  ...mediumMainWords,
  ...hardMainWords,
  ...veryHardMainWords,
] as const;

function getBlockDifficultyOffset(levelNumber: number): number {
  return Math.floor((getWorldBlockIndex(levelNumber) - 1) / 5);
}

function getMinimumIntersections(targetMainWords: number, band: ExpansionDifficultyBand): number {
  const ratio = band === 'easy' ? 0.4 : band === 'medium' ? 0.5 : band === 'hard' ? 0.58 : 0.65;
  return Math.max(1, Math.min(targetMainWords - 1, Math.floor(targetMainWords * ratio)));
}

function getBandForLevel(levelNumber: number): ExpansionDifficultyBand {
  return getDifficultyLayerForLevel(levelNumber);
}

export function getWheelUnitCountForLevel(levelNumber: number): number {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  const levelInBlock = getLevelInWorldBlock(levelNumber);
  const baseCount = wheelUnitsByLevelInBlock[levelInBlock - 1];
  const blockOffset = getBlockDifficultyOffset(levelNumber);
  return Math.min(MAX_WHEEL_UNITS, Math.max(MIN_WHEEL_UNITS, baseCount + blockOffset));
}

export function getTargetMainWordCountForLevel(levelNumber: number): number {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  const levelInBlock = getLevelInWorldBlock(levelNumber);
  const baseCount = targetMainWordsByLevelInBlock[levelInBlock - 1];
  const blockOffset = getBlockDifficultyOffset(levelNumber) * 2;
  return baseCount + blockOffset;
}

export const difficultyBands: DifficultyBandConfig[] = Array.from({ length: DIFFICULTY_BLOCK_SIZE }, (_, index) => {
  const levelInBlock = index + 1;
  const levelNumber = levelInBlock;
  const band = getBandForLevel(levelNumber);
  const wheelCount = getWheelUnitCountForLevel(levelNumber);
  const targetMainWords = getTargetMainWordCountForLevel(levelNumber);

  return {
    band,
    fromLevel: levelInBlock,
    toLevel: levelInBlock,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    targetMainWords,
    minMainWords: targetMainWords,
    maxMainWords: targetMainWords,
    minWordLength: 2,
    maxWordLength: wheelCount,
    minIntersections: getMinimumIntersections(targetMainWords, band),
    blockIndex: 1,
    levelInBlock,
  };
});

export function getDifficultyBandForLevel(levelNumber: number): DifficultyBandConfig {
  if (!isValidFullPackLevelNumber(levelNumber)) {
    throw new Error(`Level ${levelNumber} is outside the supported 1-${FULL_PACK_LEVEL_COUNT} range.`);
  }

  const band = getBandForLevel(levelNumber);
  const levelInBlock = getLevelInWorldBlock(levelNumber);
  const wheelCount = getWheelUnitCountForLevel(levelNumber);
  const targetMainWords = getTargetMainWordCountForLevel(levelNumber);

  return {
    band,
    fromLevel: levelNumber,
    toLevel: levelNumber,
    minWheelLetters: wheelCount,
    maxWheelLetters: wheelCount,
    targetMainWords,
    minMainWords: targetMainWords,
    maxMainWords: targetMainWords,
    minWordLength: 2,
    maxWordLength: wheelCount,
    minIntersections: getMinimumIntersections(targetMainWords, band),
    blockIndex: getWorldBlockIndex(levelNumber),
    levelInBlock,
  };
}

export function getExpansionDifficultyName(levelNumber: number): ExpansionDifficultyBand {
  return getDifficultyBandForLevel(levelNumber).band;
}

export function isValidFullPackLevelNumber(levelNumber: number): boolean {
  return isValidLexoraLevelNumber(levelNumber);
}
