import { describe, expect, it } from 'vitest';
import { hasOrderedPrimaryWord, validateLevelPack } from './levelPackValidator';
import { Level } from './types';

function makeLevel(id: number, letters: string[], primaryWord: string, language: Level['language'] = 'en'): Level {
  return {
    id,
    language,
    letters,
    mainWords: [
      { word: primaryWord, row: 0, col: 0, direction: 'across' },
      { word: letters.slice(0, 3).join(''), row: 0, col: 0, direction: 'down' },
    ],
    bonusWords: [],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 10,
  };
}

describe('level pack validator', () => {
  it('detects primary words matching wheel order', () => {
    expect(hasOrderedPrimaryWord(makeLevel(1, ['A', 'B', 'C', 'D', 'E'], 'ABCDE'))).toBe(true);
    expect(hasOrderedPrimaryWord(makeLevel(2, ['A', 'B', 'C', 'D', 'E'], 'EDCBA'))).toBe(true);
    expect(hasOrderedPrimaryWord(makeLevel(3, ['A', 'B', 'C', 'D', 'E'], 'BADGE'))).toBe(false);
  });

  it('detects ordered primary words for non-Latin unit languages', () => {
    expect(hasOrderedPrimaryWord(makeLevel(4, ['山', '水'], '山水', 'zh'))).toBe(true);
    expect(hasOrderedPrimaryWord(makeLevel(5, ['하', '늘'], '하늘', 'ko'))).toBe(true);
  });

  it('allows one ordered primary word in a 100-level pack', () => {
    const levels = Array.from({ length: 100 }, (_, index) => {
      if (index === 0) return makeLevel(1, ['A', 'B', 'C', 'D', 'E'], 'ABCDE');
      return makeLevel(index + 1, ['B', 'A', 'D', 'G', 'E'], 'BADGE');
    });

    const report = validateLevelPack('en', levels);
    expect(report.orderedPrimaryWordCount).toBe(1);
    expect(report.issues).toEqual([]);
  });

  it('flags more than one ordered primary word in a 100-level pack', () => {
    const levels = Array.from({ length: 100 }, (_, index) => {
      if (index < 2) return makeLevel(index + 1, ['A', 'B', 'C', 'D', 'E'], 'ABCDE');
      return makeLevel(index + 1, ['B', 'A', 'D', 'G', 'E'], 'BADGE');
    });

    const report = validateLevelPack('en', levels);
    expect(report.orderedPrimaryWordCount).toBe(2);
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0].code).toBe('pack.ordered_primary_word_rate_exceeded');
  });
});
