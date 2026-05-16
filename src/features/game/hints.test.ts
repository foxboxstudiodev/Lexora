import { describe, expect, it } from 'vitest';
import { getNextHiddenLetter, isCellRevealedByHint } from './hints';
import { Level } from '../levels/types';

function makeLevel(overrides: Partial<Level> = {}): Level {
  return {
    id: 1,
    language: 'en',
    letters: ['S', 'T', 'O', 'N', 'E'],
    mainWords: [
      { word: 'STONE', row: 0, col: 0, direction: 'across' },
      { word: 'TONE', row: 0, col: 1, direction: 'down' },
    ],
    bonusWords: [],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 10,
    ...overrides,
  };
}

describe('hint engine', () => {
  it('returns the next hidden English letter', () => {
    const level = makeLevel();
    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: 'STONE', index: 0 });
  });

  it('skips already found words', () => {
    const level = makeLevel();
    expect(getNextHiddenLetter(level, new Set(['STONE']), [])).toEqual({ word: 'TONE', index: 0 });
  });

  it('keeps Hindi grapheme-like units as one hint position', () => {
    const level = makeLevel({
      language: 'hi',
      letters: ['का', 'म', 'न'],
      mainWords: [{ word: 'का', row: 0, col: 0, direction: 'across' }],
    });

    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: 'का', index: 0 });
    expect(isCellRevealedByHint(['का'], 'का', [{ word: 'का', index: 0 }], level)).toBe(true);
  });

  it('reveals Chinese character cells by unit index', () => {
    const level = makeLevel({
      language: 'zh',
      letters: ['山', '水', '火'],
      mainWords: [{ word: '山水', row: 0, col: 0, direction: 'across' }],
    });

    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: '山水', index: 0 });
    expect(isCellRevealedByHint(['山水'], '山', [{ word: '山水', index: 0 }], level)).toBe(true);
    expect(isCellRevealedByHint(['山水'], '水', [{ word: '山水', index: 0 }], level)).toBe(false);
  });
});
