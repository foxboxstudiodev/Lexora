import { describe, expect, it } from 'vitest';
import {
  createAzerbaijaniSpacedRepetitionState,
  isAzerbaijaniReviewDue,
  reviewAzerbaijaniSpacedRepetition,
} from '../src/features/i18n/azerbaijaniSpacedRepetition';

describe('Azerbaijani spaced repetition release gate', () => {
  it('creates default Azerbaijani spaced repetition states', () => {
    const state = createAzerbaijaniSpacedRepetitionState('kitab', 1000);

    expect(state.word).toBe('kitab');
    expect(state.repetitions).toBe(0);
    expect(state.easeFactor).toBe(2.5);
  });

  it('advances Azerbaijani memory intervals after successful reviews', () => {
    const initial = createAzerbaijaniSpacedRepetitionState('ev', 1000);
    const reviewed = reviewAzerbaijaniSpacedRepetition(initial, 'good', 2000);

    expect(reviewed.repetitions).toBeGreaterThan(initial.repetitions);
    expect(reviewed.intervalDays).toBeGreaterThanOrEqual(1);
  });

  it('resets Azerbaijani repetition streaks after failed recall', () => {
    const initial = createAzerbaijaniSpacedRepetitionState('şəhər', 1000);
    const success = reviewAzerbaijaniSpacedRepetition(initial, 'good', 2000);
    const failed = reviewAzerbaijaniSpacedRepetition(success, 'again', 3000);

    expect(failed.repetitions).toBe(0);
  });

  it('detects Azerbaijani reviews that are due', () => {
    const state = createAzerbaijaniSpacedRepetitionState('məktəb', 1000);
    expect(isAzerbaijaniReviewDue(state, 2000)).toBe(true);
  });
});
