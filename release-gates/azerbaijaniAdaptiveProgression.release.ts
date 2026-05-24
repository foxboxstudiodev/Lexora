import { describe, expect, it } from 'vitest';
import {
  AZERBAIJANI_CORE_PROFILE,
  AZERBAIJANI_STARTER_PROFILE,
  getAzerbaijaniWordsForProgression,
  getNextAzerbaijaniLearnerStage,
} from '../src/features/i18n/azerbaijaniAdaptiveProgression';

describe('Azerbaijani adaptive progression release gate', () => {
  it('builds beginner-safe Azerbaijani progression pools', () => {
    const result = getAzerbaijaniWordsForProgression(
      ['ev', 'su', 'qapı', 'mənzil', 'loyal'],
      AZERBAIJANI_STARTER_PROFILE,
    );

    expect(result).toContain('ev');
    expect(result).toContain('su');
    expect(result).not.toContain('loyal');
  });

  it('filters Azerbaijani semantic duplicates for beginner progression', () => {
    const result = getAzerbaijaniWordsForProgression(
      ['ev', 'mənzil', 'bina', 'su'],
      AZERBAIJANI_STARTER_PROFILE,
    );

    expect(result.filter((word) => ['ev', 'mənzil', 'bina'].includes(word)).length).toBe(1);
  });

  it('supports Azerbaijani learner stage progression', () => {
    expect(getNextAzerbaijaniLearnerStage('starter')).toBe('early');
    expect(getNextAzerbaijaniLearnerStage('early')).toBe('core');
    expect(getNextAzerbaijaniLearnerStage('core')).toBe('advanced');
  });

  it('supports richer Azerbaijani core vocabulary pools', () => {
    const result = getAzerbaijaniWordsForProgression(
      ['ev', 'məktəb', 'meşə', 'dəniz', 'şəhər', 'maşın'],
      AZERBAIJANI_CORE_PROFILE,
    );

    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});
