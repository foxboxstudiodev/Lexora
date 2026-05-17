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
      mainWords: [{ word: 'काम', row: 0, col: 0, direction: 'across' }],
    });

    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: 'काम', index: 0 });
    expect(isCellRevealedByHint(['काम'], 'का', [{ word: 'काम', index: 0 }], level)).toBe(true);
    expect(isCellRevealedByHint(['काम'], 'म', [{ word: 'काम', index: 0 }], level)).toBe(false);
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
    expect(isCellRevealedByHint(['山水'], '水', [{ word: '山水', index: 1 }], level)).toBe(true);
  });

  it('reveals Japanese kana cells by unit index', () => {
    const level = makeLevel({
      language: 'ja',
      letters: ['さ', 'く', 'ら'],
      mainWords: [{ word: 'さくら', row: 0, col: 0, direction: 'across' }],
    });

    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: 'さくら', index: 0 });
    expect(isCellRevealedByHint(['さくら'], 'さ', [{ word: 'さくら', index: 0 }], level)).toBe(true);
    expect(isCellRevealedByHint(['さくら'], 'く', [{ word: 'さくら', index: 1 }], level)).toBe(true);
    expect(isCellRevealedByHint(['さくら'], 'ら', [{ word: 'さくら', index: 1 }], level)).toBe(false);
  });

  it('reveals Korean syllable cells by unit index', () => {
    const level = makeLevel({
      language: 'ko',
      letters: ['하', '늘', '봄'],
      mainWords: [{ word: '하늘', row: 0, col: 0, direction: 'across' }],
    });

    expect(getNextHiddenLetter(level, new Set(), [])).toEqual({ word: '하늘', index: 0 });
    expect(isCellRevealedByHint(['하늘'], '하', [{ word: '하늘', index: 0 }], level)).toBe(true);
    expect(isCellRevealedByHint(['하늘'], '늘', [{ word: '하늘', index: 1 }], level)).toBe(true);
  });
});
