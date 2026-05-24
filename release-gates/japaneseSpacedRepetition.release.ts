import { describe, expect, it } from 'vitest';
import {
  createJapaneseSpacedRepetitionState,
  isJapaneseReviewDue,
  reviewJapaneseSpacedRepetition,
} from '../src/features/i18n/japaneseSpacedRepetition';

describe('Japanese spaced repetition release gate', () => {
  it('creates stable spaced repetition state', () => {
    const state = createJapaneseSpacedRepetitionState('ねこ', 1000);

    expect(state.word).toBe('ねこ');
    expect(state.easeFactor).toBe(2.5);
    expect(state.repetitions).toBe(0);
  });

  it('updates spaced repetition progress after successful review', () => {
    const initial = createJapaneseSpacedRepetitionState('山', 1000);
    const reviewed = reviewJapaneseSpacedRepetition(initial, 'good', 2000);

    expect(reviewed.repetitions).toBeGreaterThan(initial.repetitions);
    expect(reviewed.intervalDays).toBeGreaterThan(0);
    expect(reviewed.dueAtEpochMs).toBeGreaterThan(2000);
  });

  it('resets repetition chain after failed recall', () => {
    const initial = createJapaneseSpacedRepetitionState('ゲーム', 1000);
    const reviewed = reviewJapaneseSpacedRepetition(initial, 'again', 2000);

    expect(reviewed.repetitions).toBe(0);
  });

  it('detects due Japanese reviews safely', () => {
    const state = createJapaneseSpacedRepetitionState('ねこ', 1000);

    expect(isJapaneseReviewDue(state, 2000)).toBe(true);
  });
});
