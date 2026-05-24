import { describe, expect, it } from 'vitest';
import {
  isAzerbaijaniWheelBalanced,
  scoreAzerbaijaniWheelBalance,
} from '../src/features/i18n/azerbaijaniWheelBalance';

describe('Azerbaijani wheel balance release gate', () => {
  it('accepts balanced Azerbaijani wheel layouts', () => {
    const report = scoreAzerbaijaniWheelBalance(
      ['e', 'v', 'k', 'i', 't', 'a', 'b'],
      ['ev', 'kitab'],
    );

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(isAzerbaijaniWheelBalanced(['e', 'v', 'k', 'i', 't', 'a', 'b'], ['ev', 'kitab'])).toBe(true);
  });

  it('rejects duplicate or invalid Azerbaijani wheel units', () => {
    const report = scoreAzerbaijaniWheelBalance(
      ['e', 'e', '1', '?'],
      ['ev'],
    );

    expect(report.score).toBeLessThan(60);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('penalizes missing Azerbaijani candidate letters', () => {
    const report = scoreAzerbaijaniWheelBalance(
      ['e', 'v'],
      ['ev', 'kitab'],
    );

    expect(report.score).toBeLessThan(80);
  });
});
