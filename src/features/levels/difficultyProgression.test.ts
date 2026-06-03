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

const wheelPattern = [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10];
const wordPattern = [2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 14, 14, 16, 17];

describe('difficulty progression', () => {
  it('uses the 1000-level / 50-block structure', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(1000);
    expect(DIFFICULTY_BLOCK_SIZE).toBe(20);
    expect(DIFFICULTY_BLOCK_COUNT).toBe(50);
  });

  it('uses the exact master-plan 20-level law', () => {
    expect([...wheelUnitsByLevelInBlock]).toEqual(wheelPattern);
    expect([...targetMainWordsByLevelInBlock]).toEqual(wordPattern);
  });

  it('restarts the law every 20 levels across all 50 blocks', () => {
    for (let blockIndex = 0; blockIndex < DIFFICULTY_BLOCK_COUNT; blockIndex += 1) {
      for (let index = 0; index < DIFFICULTY_BLOCK_SIZE; index += 1) {
        const levelNumber = blockIndex * DIFFICULTY_BLOCK_SIZE + index + 1;
        expect(getWheelUnitCountForLevel(levelNumber), `wheel level ${levelNumber}`).toBe(wheelPattern[index]);
        expect(getTargetMainWordCountForLevel(levelNumber), `words level ${levelNumber}`).toBe(wordPattern[index]);
      }
    }
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
      expect(band.minWheelLetters).toBe(wheelPattern[expectedLevelInBlock - 1]);
      expect(band.maxWheelLetters).toBe(wheelPattern[expectedLevelInBlock - 1]);
      expect(band.targetMainWords).toBe(wordPattern[expectedLevelInBlock - 1]);
      expect(band.minMainWords).toBe(wordPattern[expectedLevelInBlock - 1]);
      expect(band.maxMainWords).toBe(wordPattern[expectedLevelInBlock - 1]);
    }
  });

  it('rejects invalid full-pack level numbers', () => {
    expect(isValidFullPackLevelNumber(0)).toBe(false);
    expect(isValidFullPackLevelNumber(1001)).toBe(false);
    expect(isValidFullPackLevelNumber(1.5)).toBe(false);
    expect(isValidFullPackLevelNumber(1)).toBe(true);
    expect(isValidFullPackLevelNumber(1000)).toBe(true);
  });
});
