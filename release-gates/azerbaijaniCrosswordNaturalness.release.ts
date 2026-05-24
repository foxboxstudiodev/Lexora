import { describe, expect, it } from 'vitest';
import {
  isAzerbaijaniCrosswordNatural,
  scoreAzerbaijaniCrosswordNaturalness,
} from '../src/features/i18n/azerbaijaniCrosswordNaturalness';

describe('Azerbaijani crossword naturalness release gate', () => {
  it('accepts natural Azerbaijani crossword pools', () => {
    const report = scoreAzerbaijaniCrosswordNaturalness([
      'ev',
      'kitab',
      'qapı',
      'şəhər',
      'məktəb',
    ]);

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(isAzerbaijaniCrosswordNatural(['ev', 'kitab', 'qapı', 'şəhər', 'məktəb'])).toBe(true);
  });

  it('rejects fake Azerbaijani crossword pools', () => {
    const report = scoreAzerbaijaniCrosswordNaturalness([
      'qip',
      'paq',
      'loyal',
      'veda',
    ]);

    expect(report.score).toBeLessThan(50);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('penalizes semantic repetition overload', () => {
    const report = scoreAzerbaijaniCrosswordNaturalness([
      'ev',
      'mənzil',
      'bina',
      'şəhər',
      'kənd',
    ]);

    expect(report.duplicateSemanticGroups).toBeGreaterThan(1);
    expect(report.score).toBeLessThan(90);
  });
});
