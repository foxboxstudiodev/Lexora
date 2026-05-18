import { describe, expect, it } from 'vitest';
import { validateGuess, isLevelComplete, normalizeLevelWord } from './engine';
import { getNextHiddenLetter } from './hints';
import { Level } from '../levels/types';

function makeLevel(word = 'STO'): Level {
  return {
    id: 1,
    language: 'en',
    letters: ['S', 'T', 'O', 'A'],
    mainWords: [{ word, row: 0, col: 0, direction: 'across' }],
    bonusWords: [],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 10,
  };
}

describe('hint and manual word recognition parity', () => {
  it('accepts manually built main words that the hint system would reveal', () => {
    const level = makeLevel('STO');
    const hint = getNextHiddenLetter(level, new Set(), []);

    expect(hint?.word).toBe(normalizeLevelWord('STO', level));
    expect(validateGuess(level, 'STO', new Set(), new Set())).toEqual({ status: 'main', word: 'STO' });
  });

  it('treats a hint-completed final word as enough to complete the level', () => {
    const level = makeLevel('STO');
    const foundWords = new Set([normalizeLevelWord('STO', level)]);

    expect(isLevelComplete(level, foundWords)).toBe(true);
  });

  it('keeps Russian manual input aligned with normalized puzzle words', () => {
    const level: Level = {
      ...makeLevel('СТО'),
      language: 'ru',
      letters: ['С', 'Т', 'О', 'А'],
      mainWords: [{ word: 'СТО', row: 0, col: 0, direction: 'across' }],
    };

    const hint = getNextHiddenLetter(level, new Set(), []);
    expect(hint?.word).toBe(normalizeLevelWord('сто', level));
    expect(validateGuess(level, 'сто', new Set(), new Set()).status).toBe('main');
  });
});
