import { describe, expect, it } from 'vitest';
import {
  isJapaneseIntersectionNatural,
  scoreJapaneseIntersection,
} from '../src/features/i18n/japaneseIntersectionScoring';

describe('Japanese intersection scoring release gate', () => {
  it('scores natural Japanese intersections safely', () => {
    const report = scoreJapaneseIntersection({
      words: ['ねこ', 'こいぬ'],
      sharedUnit: 'こ',
    });

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.warnings.length).toBe(0);
  });

  it('detects problematic Japanese intersections', () => {
    const report = scoreJapaneseIntersection({
      words: ['unknown'],
      sharedUnit: '',
    });

    expect(report.score).toBeLessThan(80);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('supports naturalness threshold checks', () => {
    expect(
      isJapaneseIntersectionNatural({
        words: ['ねこ', 'こいぬ'],
        sharedUnit: 'こ',
      }),
    ).toBe(true);

    expect(
      isJapaneseIntersectionNatural({
        words: ['unknown'],
        sharedUnit: '',
      }),
    ).toBe(false);
  });
});
