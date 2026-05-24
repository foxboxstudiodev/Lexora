import { describe, expect, it } from 'vitest';
import {
  isJapaneseWheelBalanced,
  scoreJapaneseWheelBalance,
} from '../src/features/i18n/japaneseWheelBalance';

describe('Japanese wheel balance release gate', () => {
  it('scores balanced Japanese wheels safely', () => {
    const report = scoreJapaneseWheelBalance(
      ['ね', 'こ', 'い', 'ぬ', '山'],
      ['ねこ', 'いぬ', '山'],
    );

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.uniqueUnitCount).toBeGreaterThanOrEqual(4);
  });

  it('detects problematic Japanese wheel configurations', () => {
    const report = scoreJapaneseWheelBalance(['x', 'x'], ['unknown']);

    expect(report.score).toBeLessThan(80);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('supports wheel balance threshold checks', () => {
    expect(isJapaneseWheelBalanced(['ね', 'こ', 'い', 'ぬ'], ['ねこ', 'いぬ'])).toBe(true);
    expect(isJapaneseWheelBalanced(['x', 'x'], ['unknown'])).toBe(false);
  });
});
