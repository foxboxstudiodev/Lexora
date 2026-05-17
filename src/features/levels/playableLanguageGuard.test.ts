import { describe, expect, it } from 'vitest';
import { getPlayableLanguageCodes, getPlayableRuntimeLevels, isPlayableRuntimeLevel } from './playableLanguageGuard';
import { Level } from './types';

const languages = ['en', 'es', 'ru', 'tr', 'de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko'] as const;

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
  it('exposes all playable language codes', () => {
    expect(getPlayableLanguageCodes()).toEqual([...languages]);
  });

  it('accepts every target runtime language', () => {
    for (const language of languages) {
      expect(isPlayableRuntimeLevel(makeLevel(language))).toBe(true);
    }
  });

  it('keeps all target languages in the playable set', () => {
    const levels = languages.map(makeLevel);
    expect(getPlayableRuntimeLevels(levels).map((level) => level.language)).toEqual([...languages]);
  });
});
