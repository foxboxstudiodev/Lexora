import { describe, expect, it } from 'vitest';
import { clampWheelUnitCount, isWheelUnitCountAllowed, MAX_WHEEL_UNITS, MIN_WHEEL_UNITS, normalizeWheelUnitRange } from './wheelRules';

describe('global wheel unit rules', () => {
  it('defines the required wheel unit range', () => {
    expect(MIN_WHEEL_UNITS).toBe(5);
    expect(MAX_WHEEL_UNITS).toBe(10);
  });

  it('clamps wheel unit counts to the allowed range', () => {
    expect(clampWheelUnitCount(1)).toBe(5);
    expect(clampWheelUnitCount(7)).toBe(7);
    expect(clampWheelUnitCount(20)).toBe(10);
  });

  it('normalizes wheel unit ranges', () => {
    expect(normalizeWheelUnitRange(1, 20)).toEqual({ minWheelUnits: 5, maxWheelUnits: 10 });
    expect(normalizeWheelUnitRange(8, 6)).toEqual({ minWheelUnits: 8, maxWheelUnits: 8 });
  });

  it('checks allowed wheel unit counts', () => {
    expect(isWheelUnitCountAllowed(4)).toBe(false);
    expect(isWheelUnitCountAllowed(5)).toBe(true);
    expect(isWheelUnitCountAllowed(10)).toBe(true);
    expect(isWheelUnitCountAllowed(11)).toBe(false);
  });
});
