import { describe, expect, it } from 'vitest';
import {
  isJapaneseCrosswordNatural,
  scoreJapaneseCrosswordNaturalness,
} from '../src/features/i18n/japaneseCrosswordNaturalness';

describe('Japanese crossword naturalness release gate', () => {
  it('scores balanced Japanese crossword pools safely', () => {
    const report = scoreJapaneseCrosswordNaturalness(['ねこ', 'いぬ', '山', 'ゲーム']);

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.scriptBalance.buckets.hiragana).toBeGreaterThan(0);
    expect(report.scriptBalance.buckets.katakana).toBeGreaterThan(0);
    expect(report.scriptBalance.buckets.kanji).toBeGreaterThan(0);
  });

  it('detects problematic Japanese crossword pools', () => {
    const report = scoreJapaneseCrosswordNaturalness(['x', 'x']);

    expect(report.score).toBeLessThan(80);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('supports naturalness threshold checks', () => {
    expect(isJapaneseCrosswordNatural(['ねこ', 'いぬ', '山', 'ゲーム'])).toBe(true);
    expect(isJapaneseCrosswordNatural(['x', 'x'])).toBe(false);
  });
});
