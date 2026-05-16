import { describe, expect, it } from 'vitest';
import { getPlayableLanguageCodes, getPlayableRuntimeLevels, isPlayableRuntimeLevel } from './playableLanguageGuard';
import { Level } from './types';

function makeLevel(language: Level['language']): Level {
  return {
    id: 1,
    language,
    letters: ['A', 'B', 'C', 'D', 'E'],
    mainWords: [
      { word: 'ABCDE', row: 0, col: 0, direction: 'across' },
      { word: 'BAD', row: 0, col: 1, direction: 'down' },
    ],
    bonusWords: [],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 10,
  };
}

describe('playable language guard', () => {
  it('exposes the current playable language codes', () => {
    expect(getPlayableLanguageCodes()).toEqual(['en', 'es', 'ru', 'tr']);
  });

  it('accepts active runtime languages', () => {
    expect(isPlayableRuntimeLevel(makeLevel('en'))).toBe(true);
    expect(isPlayableRuntimeLevel(makeLevel('tr'))).toBe(true);
  });

  it('filters planned runtime languages out of the playable set', () => {
    const levels = [makeLevel('en'), makeLevel('de'), makeLevel('zh')];
    expect(getPlayableRuntimeLevels(levels).map((level) => level.language)).toEqual(['en']);
  });
});
