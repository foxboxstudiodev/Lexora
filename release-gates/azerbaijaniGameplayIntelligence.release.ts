import { describe, expect, it } from 'vitest';
import {
  isAzerbaijaniGameplayReady,
  scoreAzerbaijaniGameplayIntelligence,
} from '../src/features/i18n/azerbaijaniGameplayIntelligence';

describe('Azerbaijani gameplay intelligence release gate', () => {
  it('accepts high-quality Azerbaijani gameplay configurations', () => {
    const report = scoreAzerbaijaniGameplayIntelligence({
      words: ['ev', 'kitab', 'məktəb', 'şəhər'],
      wheelUnits: ['e', 'v', 'k', 'i', 't', 'a', 'b', 'm', 'ə', 'ş', 'h', 'r'],
      intersections: [
        { words: ['ev', 'sevgi'], sharedUnit: 'ev' },
      ],
    });

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.risk).toBe('low');
    expect(isAzerbaijaniGameplayReady({
      words: ['ev', 'kitab', 'məktəb', 'şəhər'],
      wheelUnits: ['e', 'v', 'k', 'i', 't', 'a', 'b', 'm', 'ə', 'ş', 'h', 'r'],
      intersections: [
        { words: ['ev', 'sevgi'], sharedUnit: 'ev' },
      ],
    })).toBe(true);
  });

  it('rejects weak Azerbaijani gameplay configurations', () => {
    const report = scoreAzerbaijaniGameplayIntelligence({
      words: ['qip', 'paq', 'loyal'],
      wheelUnits: ['q', 'q', '?'],
      intersections: [
        { words: ['qip', 'paq'], sharedUnit: 'x' },
      ],
    });

    expect(report.score).toBeLessThan(70);
    expect(report.risk).toBe('high');
  });
});
