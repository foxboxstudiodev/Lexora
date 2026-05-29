import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_BLOCK_COUNT,
  DIFFICULTY_BLOCK_SIZE,
  FULL_PACK_LEVEL_COUNT,
  getDifficultyBandForLevel,
  getTargetMainWordCountForLevel,
  getWheelUnitCountForLevel,
  isValidFullPackLevelNumber,
  targetMainWordsByLevelInBlock,
  wheelUnitsByLevelInBlock,
} from './difficultyProgression';

const wheelPattern = [
  4, 4, 4, 4, 5, 5, 5, 5, 5, 5,
  5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7,
  7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 9, 9, 10, 10, 10, 10, 10, 10, 10,
];
const wordPattern = [
  2, 3, 3, 4, 4, 5, 5, 6, 6, 7,
  7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14,
  14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21,
  21, 22, 22, 23, 23, 24, 24, 25, 25, 26,
];

describe('difficulty progression', () => {
  it('uses the master-plan 1000-level / 20-block structure', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(1000);
    expect(DIFFICULTY_BLOCK_SIZE).toBe(50);
    expect(DIFFICULTY_BLOCK_COUNT).toBe(20);
  });

  it('uses the exact master-plan 50-level law', () => {
    expect([...wheelUnitsByLevelInBlock]).toEqual(wheelPattern);
    expect([...targetMainWordsByLevelInBlock]).toEqual(wordPattern);
  });

  it('keeps block metadata correct for every full-pack level', () => {
    for (let levelNumber = 1; levelNumber <= FULL_PACK_LEVEL_COUNT; levelNumber += 1) {
      const band = getDifficultyBandForLevel(levelNumber);
      const expectedBlockIndex = Math.floor((levelNumber - 1) / DIFFICULTY_BLOCK_SIZE) + 1;
      const expectedLevelInBlock = ((levelNumber - 1) % DIFFICULTY_BLOCK_SIZE) + 1;

      expect(band.fromLevel).toBe(levelNumber);
      expect(band.toLevel).toBe(levelNumber);
      expect(band.blockIndex).toBe(expectedBlockIndex);
      expect(band.levelInBlock).toBe(expectedLevelInBlock);
      expect(band.minWheelLetters).toBe(getWheelUnitCountForLevel(levelNumber));
      expect(band.maxWheelLetters).toBe(getWheelUnitCountForLevel(levelNumber));
      expect(band.targetMainWords).toBe(getTargetMainWordCountForLevel(levelNumber));
      expect(band.minMainWords).toBe(getTargetMainWordCountForLevel(levelNumber));
      expect(band.maxMainWords).toBe(getTargetMainWordCountForLevel(levelNumber));
    }
  });

  it('applies progressive difficulty offsets across block groups', () => {
    expect(getWheelUnitCountForLevel(1)).toBe(4);
    expect(getWheelUnitCountForLevel(251)).toBe(5);
    expect(getWheelUnitCountForLevel(501)).toBe(6);
    expect(getWheelUnitCountForLevel(751)).toBe(7);

    expect(getTargetMainWordCountForLevel(1)).toBe(2);
    expect(getTargetMainWordCountForLevel(251)).toBe(4);
    expect(getTargetMainWordCountForLevel(501)).toBe(6);
    expect(getTargetMainWordCountForLevel(751)).toBe(8);
  });

  it('rejects invalid full-pack level numbers', () => {
    expect(isValidFullPackLevelNumber(0)).toBe(false);
    expect(isValidFullPackLevelNumber(1001)).toBe(false);
    expect(isValidFullPackLevelNumber(1.5)).toBe(false);
    expect(isValidFullPackLevelNumber(1)).toBe(true);
    expect(isValidFullPackLevelNumber(1000)).toBe(true);
  });
});
