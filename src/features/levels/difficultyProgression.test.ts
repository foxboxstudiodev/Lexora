import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_BLOCK_COUNT,
  DIFFICULTY_BLOCK_SIZE,
  FULL_PACK_LEVEL_COUNT,
  getTargetMainWordCountForLevel,
  getWheelUnitCountForLevel,
  targetMainWordsByLevelInBlock,
  wheelUnitsByLevelInBlock,
} from './difficultyProgression';

const wheelPattern = [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10];
const wordPattern = [2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 14, 14, 16, 17];

describe('difficulty progression', () => {
  it('uses the master-plan 300-level / 15-block structure', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(300);
    expect(DIFFICULTY_BLOCK_SIZE).toBe(20);
    expect(DIFFICULTY_BLOCK_COUNT).toBe(15);
  });

  it('uses the exact master-plan 20-level law', () => {
    expect([...wheelUnitsByLevelInBlock]).toEqual(wheelPattern);
    expect([...targetMainWordsByLevelInBlock]).toEqual(wordPattern);
  });

  it('restarts the law every 20 levels', () => {
    expect(getTargetMainWordCountForLevel(1)).toBe(2);
    expect(getTargetMainWordCountForLevel(20)).toBe(17);
    expect(getTargetMainWordCountForLevel(21)).toBe(2);
    expect(getTargetMainWordCountForLevel(40)).toBe(17);
    expect(getTargetMainWordCountForLevel(281)).toBe(2);
    expect(getTargetMainWordCountForLevel(300)).toBe(17);

    expect(getWheelUnitCountForLevel(1)).toBe(4);
    expect(getWheelUnitCountForLevel(20)).toBe(10);
    expect(getWheelUnitCountForLevel(21)).toBe(4);
    expect(getWheelUnitCountForLevel(300)).toBe(10);
  });
});
