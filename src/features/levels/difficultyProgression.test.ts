import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_BLOCK_COUNT,
  DIFFICULTY_BLOCK_SIZE,
  FULL_PACK_LEVEL_COUNT,
  difficultyBands,
  getDifficultyBandForLevel,
  getExpansionDifficultyName,
  getWheelUnitCountForLevel,
  isValidFullPackLevelNumber,
  wheelUnitsByLevelInBlock,
} from './difficultyProgression';
import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

const expectedBlockWheelPattern = [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10];

describe('difficulty progression', () => {
  it('defines a 300-level full pack target split into 15 blocks of 20', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(300);
    expect(DIFFICULTY_BLOCK_SIZE).toBe(20);
    expect(DIFFICULTY_BLOCK_COUNT).toBe(15);
  });

  it('uses the exact wheel-letter choice pattern inside every 20-level block', () => {
    expect([...wheelUnitsByLevelInBlock]).toEqual(expectedBlockWheelPattern);
  });

  it('restarts wheel difficulty every 20 levels', () => {
    for (let block = 0; block < DIFFICULTY_BLOCK_COUNT; block += 1) {
      const firstLevel = block * DIFFICULTY_BLOCK_SIZE + 1;
      const lastLevel = firstLevel + DIFFICULTY_BLOCK_SIZE - 1;

      expect(getWheelUnitCountForLevel(firstLevel)).toBe(4);
      expect(getWheelUnitCountForLevel(firstLevel + 1)).toBe(4);
      expect(getWheelUnitCountForLevel(firstLevel + 2)).toBe(5);
      expect(getWheelUnitCountForLevel(firstLevel + 10)).toBe(7);
      expect(getWheelUnitCountForLevel(firstLevel + 17)).toBe(9);
      expect(getWheelUnitCountForLevel(lastLevel)).toBe(10);
    }
  });

  it('matches explicit boundary examples requested for all blocks', () => {
    expect(getWheelUnitCountForLevel(1)).toBe(4);
    expect(getWheelUnitCountForLevel(2)).toBe(4);
    expect(getWheelUnitCountForLevel(3)).toBe(5);
    expect(getWheelUnitCountForLevel(20)).toBe(10);
    expect(getWheelUnitCountForLevel(21)).toBe(4);
    expect(getWheelUnitCountForLevel(40)).toBe(10);
    expect(getWheelUnitCountForLevel(41)).toBe(4);
    expect(getWheelUnitCountForLevel(60)).toBe(10);
    expect(getWheelUnitCountForLevel(281)).toBe(4);
    expect(getWheelUnitCountForLevel(300)).toBe(10);
  });

  it('covers the 20-step block template without gaps', () => {
    expect(difficultyBands).toHaveLength(20);
    expect(difficultyBands[0].fromLevel).toBe(1);
    expect(difficultyBands[19].toLevel).toBe(20);

    for (let index = 1; index < difficultyBands.length; index += 1) {
      expect(difficultyBands[index].fromLevel).toBe(difficultyBands[index - 1].toLevel + 1);
    }
  });

  it('keeps every wheel choice count inside the global 4 to 10 rule', () => {
    for (let level = 1; level <= FULL_PACK_LEVEL_COUNT; level += 1) {
      const config = getDifficultyBandForLevel(level);
      expect(config.minWheelLetters).toBeGreaterThanOrEqual(MIN_WHEEL_UNITS);
      expect(config.maxWheelLetters).toBeLessThanOrEqual(MAX_WHEEL_UNITS);
      expect(config.minWheelLetters).toBe(config.maxWheelLetters);
    }
  });

  it('maps block positions to increasing difficulty bands', () => {
    expect(getExpansionDifficultyName(1)).toBe('easy');
    expect(getExpansionDifficultyName(4)).toBe('easy');
    expect(getExpansionDifficultyName(5)).toBe('light-medium');
    expect(getExpansionDifficultyName(10)).toBe('light-medium');
    expect(getExpansionDifficultyName(11)).toBe('medium');
    expect(getExpansionDifficultyName(14)).toBe('medium');
    expect(getExpansionDifficultyName(15)).toBe('hard');
    expect(getExpansionDifficultyName(18)).toBe('hard');
    expect(getExpansionDifficultyName(19)).toBe('advanced');
    expect(getExpansionDifficultyName(20)).toBe('advanced');
    expect(getExpansionDifficultyName(21)).toBe('easy');
  });

  it('validates full pack level numbers', () => {
    expect(isValidFullPackLevelNumber(1)).toBe(true);
    expect(isValidFullPackLevelNumber(300)).toBe(true);
    expect(isValidFullPackLevelNumber(0)).toBe(false);
    expect(isValidFullPackLevelNumber(301)).toBe(false);
    expect(isValidFullPackLevelNumber(1.5)).toBe(false);
  });

  it('throws outside the supported range', () => {
    expect(() => getDifficultyBandForLevel(0)).toThrow();
    expect(() => getDifficultyBandForLevel(301)).toThrow();
    expect(() => getWheelUnitCountForLevel(0)).toThrow();
    expect(() => getWheelUnitCountForLevel(301)).toThrow();
  });
});
