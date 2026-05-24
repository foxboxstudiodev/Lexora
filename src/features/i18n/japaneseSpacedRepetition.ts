export type JapaneseRecallQuality = 'again' | 'hard' | 'good' | 'easy';

export type JapaneseSpacedRepetitionState = {
  word: string;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  dueAtEpochMs: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function createJapaneseSpacedRepetitionState(word: string, nowEpochMs = Date.now()): JapaneseSpacedRepetitionState {
  return {
    word: word.trim(),
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueAtEpochMs: nowEpochMs,
  };
}

function getQualityScore(quality: JapaneseRecallQuality): number {
  if (quality === 'again') return 1;
  if (quality === 'hard') return 3;
  if (quality === 'good') return 4;
  return 5;
}

function nextEaseFactor(currentEaseFactor: number, quality: JapaneseRecallQuality): number {
  const score = getQualityScore(quality);
  const next = currentEaseFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
  return Math.max(1.3, Number(next.toFixed(2)));
}

function nextIntervalDays(state: JapaneseSpacedRepetitionState, quality: JapaneseRecallQuality): number {
  if (quality === 'again') return 0;
  if (quality === 'hard') return Math.max(1, Math.round(state.intervalDays * 1.2));
  if (state.repetitions === 0) return 1;
  if (state.repetitions === 1) return quality === 'easy' ? 4 : 3;
  const multiplier = quality === 'easy' ? state.easeFactor + 0.35 : state.easeFactor;
  return Math.max(1, Math.round(state.intervalDays * multiplier));
}

export function reviewJapaneseSpacedRepetition(
  state: JapaneseSpacedRepetitionState,
  quality: JapaneseRecallQuality,
  nowEpochMs = Date.now(),
): JapaneseSpacedRepetitionState {
  const easeFactor = nextEaseFactor(state.easeFactor, quality);
  const intervalDays = nextIntervalDays(state, quality);
  const repetitions = quality === 'again' ? 0 : state.repetitions + 1;

  return {
    word: state.word,
    repetitions,
    easeFactor,
    intervalDays,
    dueAtEpochMs: nowEpochMs + intervalDays * DAY_MS,
  };
}

export function isJapaneseReviewDue(state: JapaneseSpacedRepetitionState, nowEpochMs = Date.now()): boolean {
  return state.dueAtEpochMs <= nowEpochMs;
}
