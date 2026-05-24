import { describe, expect, it } from 'vitest';
import {
  isAzerbaijaniIntersectionNatural,
  scoreAzerbaijaniIntersection,
} from '../src/features/i18n/azerbaijaniIntersectionScoring';

describe('Azerbaijani intersection release gate', () => {
  it('accepts natural Azerbaijani intersections', () => {
    const report = scoreAzerbaijaniIntersection({
      words: ['ev', 'sevgi'],
      sharedUnit: 'ev',
    });

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(isAzerbaijaniIntersectionNatural({
      words: ['ev', 'sevgi'],
      sharedUnit: 'ev',
    })).toBe(true);
  });

  it('rejects invalid Azerbaijani intersections', () => {
    const report = scoreAzerbaijaniIntersection({
      words: ['qip', 'paq'],
      sharedUnit: 'x',
    });

    expect(report.score).toBeLessThan(50);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('penalizes Azerbaijani semantic repetition intersections', () => {
    const report = scoreAzerbaijaniIntersection({
      words: ['ev', 'mənzil'],
      sharedUnit: 'e',
    });

    expect(report.score).toBeLessThan(95);
  });
});
