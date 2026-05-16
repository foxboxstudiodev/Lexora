import { describe, expect, it } from 'vitest';
import { FULL_PACK_LEVEL_COUNT, difficultyBands, getDifficultyBandForLevel, getExpansionDifficultyName, isValidFullPackLevelNumber } from './difficultyProgression';
import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

describe('difficulty progression', () => {
  it('defines a 300-level full pack target', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(300);
  });

  it('covers the complete 1-300 range without gaps', () => {
    const lastBand = difficultyBands[difficultyBands.length - 1];

    expect(difficultyBands[0].fromLevel).toBe(1);
    expect(lastBand.toLevel).toBe(300);

    for (let index = 1; index < difficultyBands.length; index += 1) {
      expect(difficultyBands[index].fromLevel).toBe(difficultyBands[index - 1].toLevel + 1);
    }
  });

  it('keeps every wheel range inside the global 5 to 10 rule', () => {
    for (const band of difficultyBands) {
      expect(band.minWheelLetters).toBeGreaterThanOrEqual(MIN_WHEEL_UNITS);
      expect(band.maxWheelLetters).toBeLessThanOrEqual(MAX_WHEEL_UNITS);
      expect(band.maxWheelLetters).toBeGreaterThanOrEqual(band.minWheelLetters);
    }
  });

  it('allows advanced levels to reach the global maximum wheel size', () => {
    expect(getDifficultyBandForLevel(300).maxWheelLetters).toBe(MAX_WHEEL_UNITS);
  });

  it('maps key level ranges to the expected bands', () => {
    expect(getExpansionDifficultyName(1)).toBe('easy');
    expect(getExpansionDifficultyName(50)).toBe('easy');
    expect(getExpansionDifficultyName(51)).toBe('light-medium');
    expect(getExpansionDifficultyName(120)).toBe('light-medium');
    expect(getExpansionDifficultyName(121)).toBe('medium');
    expect(getExpansionDifficultyName(200)).toBe('medium');
    expect(getExpansionDifficultyName(201)).toBe('hard');
    expect(getExpansionDifficultyName(260)).toBe('hard');
    expect(getExpansionDifficultyName(261)).toBe('advanced');
    expect(getExpansionDifficultyName(300)).toBe('advanced');
  });

  it('increases expected complexity over time', () => {
    const early = getDifficultyBandForLevel(1);
    const late = getDifficultyBandForLevel(300);

    expect(late.maxWheelLetters).toBeGreaterThan(early.maxWheelLetters);
    expect(late.maxMainWords).toBeGreaterThan(early.maxMainWords);
    expect(late.minIntersections).toBeGreaterThan(early.minIntersections);
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
  });
});
