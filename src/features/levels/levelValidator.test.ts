import { describe, expect, it } from 'vitest';
import { getBlockingLevelErrors, getExpansionLevelWarnings, validateLevel } from './levelValidator';
import { Level } from './types';

function makeLevel(overrides: Partial<Level> = {}): Level {
  return {
    id: 1,
    language: 'en',
    letters: ['S', 'T', 'O', 'N', 'E'],
    mainWords: [
      { word: 'STONE', row: 0, col: 0, direction: 'across' },
      { word: 'TONE', row: 0, col: 1, direction: 'down' },
    ],
    bonusWords: ['ONE'],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 10,
    ...overrides,
  };
}

describe('level validator', () => {
  it('accepts a valid English runtime level without blocking errors', () => {
    const level = makeLevel();
    expect(getBlockingLevelErrors(level)).toEqual([]);
  });

  it('validates Chinese character wheel buildability', () => {
    const level = makeLevel({
      language: 'zh',
      letters: ['山', '水', '火', '人', '木'],
      mainWords: [
        { word: '山水', row: 0, col: 0, direction: 'across' },
        { word: '水火', row: 0, col: 1, direction: 'down' },
      ],
      bonusWords: [],
    });

    expect(getBlockingLevelErrors(level)).toEqual([]);
  });

  it('validates Hindi grapheme-like wheel buildability', () => {
    const level = makeLevel({
      language: 'hi',
      letters: ['का', 'म', 'न', 'ल', 'र'],
      mainWords: [
        { word: 'का', row: 0, col: 0, direction: 'across' },
        { word: 'म', row: 0, col: 0, direction: 'down' },
      ],
      bonusWords: [],
    });

    const errors = getBlockingLevelErrors(level).map((error) => error.code);
    expect(errors).not.toContain('word.impossible');
  });

  it('reports impossible words with language-aware units', () => {
    const level = makeLevel({
      language: 'zh',
      letters: ['山', '水', '火', '人', '土'],
      mainWords: [
        { word: '山水', row: 0, col: 0, direction: 'across' },
        { word: '木火', row: 0, col: 1, direction: 'down' },
      ],
      bonusWords: [],
    });

    const errors = getBlockingLevelErrors(level).map((error) => error.code);
    expect(errors).toContain('word.impossible');
  });

  it('blocks levels with too few wheel units', () => {
    const level = makeLevel({ letters: ['A', 'B', 'C'] });
    const codes = getBlockingLevelErrors(level).map((error) => error.code);

    expect(codes).toContain('wheel.units.too_few');
    expect(getExpansionLevelWarnings(level).map((error) => error.code)).not.toContain('wheel.units.too_few');
  });

  it('blocks levels with too many wheel units', () => {
    const level = makeLevel({ letters: ['S', 'T', 'O', 'N', 'E', 'A', 'B', 'C', 'D', 'F', 'G'] });
    const codes = getBlockingLevelErrors(level).map((error) => error.code);

    expect(codes).toContain('wheel.units.too_many');
  });

  it('detects grid letter conflicts as blocking errors', () => {
    const level = makeLevel({
      mainWords: [
        { word: 'CAT', row: 0, col: 0, direction: 'across' },
        { word: 'DOG', row: 0, col: 0, direction: 'down' },
      ],
      letters: ['C', 'A', 'T', 'D', 'O', 'G'],
    });

    expect(validateLevel(level).map((error) => error.code)).toContain('grid.letter_conflict');
  });
});
