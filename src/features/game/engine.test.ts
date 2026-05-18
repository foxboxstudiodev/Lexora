import { describe, expect, it } from 'vitest';
import { buildGrid, gridBounds, isLevelComplete, normalizeWord, validateGuess } from './engine';
import { Level } from '../levels/types';

const level: Level = {
  id: 1,
  language: 'en',
  letters: ['S', 'T', 'A', 'R'],
  mainWords: [
    { word: 'STAR', row: 0, col: 0, direction: 'across' },
    { word: 'ART', row: 1, col: 1, direction: 'across' },
  ],
  bonusWords: ['TAR'],
  difficulty: 'easy',
  themeId: 'dawn-garden',
  rewardCoins: 15,
};

describe('word engine', () => {
  it('normalizes words without corrupting multilingual letters', () => {
    expect(normalizeWord(' star ')).toBe('STAR');
    expect(normalizeWord('silver')).toBe('SILVER');
    expect(normalizeWord('ёлка')).toBe('ЕЛКА');
    expect(normalizeWord('sevgİ')).toBe('SEVGİ');
    expect(normalizeWord('ateş')).toBe('ATEŞ');
  });

  it('builds a normal English grid', () => {
    const cells = buildGrid(level.mainWords, 'en');
    expect(cells.some((cell) => cell.letter === 'S')).toBe(true);
    expect(cells.length).toBeGreaterThan(0);
  });

  it('compacts sparse source coordinates before rendering', () => {
    const cells = buildGrid([
      { word: 'TREE', row: 0, col: 0, direction: 'across' },
      { word: 'TEA', row: 0, col: 12, direction: 'down' },
    ], 'en');
    const bounds = gridBounds(cells);

    expect(Math.min(...cells.map((cell) => cell.row))).toBe(0);
    expect(Math.min(...cells.map((cell) => cell.col))).toBe(0);
    expect(bounds.cols).toBeLessThan(8);
  });

  it('builds a Chinese grid by character units', () => {
    const chineseLevel: Level = {
      ...level,
      language: 'zh',
      letters: ['山', '水', '火', '人', '木'],
      mainWords: [
        { word: '山水', row: 0, col: 0, direction: 'across' },
        { word: '水火', row: 0, col: 1, direction: 'down' },
      ],
      bonusWords: [],
    };

    const cells = buildGrid(chineseLevel.mainWords, chineseLevel.language);
    expect(cells.map((cell) => cell.letter)).toEqual(expect.arrayContaining(['山', '水', '火']));
  });

  it('keeps Hindi grapheme-like units in runtime grid cells', () => {
    const hindiLevel: Level = {
      ...level,
      language: 'hi',
      letters: ['का', 'म', 'न', 'र'],
      mainWords: [{ word: 'काम', row: 0, col: 0, direction: 'across' }],
      bonusWords: [],
    };

    const cells = buildGrid(hindiLevel.mainWords, hindiLevel.language);
    expect(cells.map((cell) => cell.letter)).toEqual(['का', 'म']);
  });

  it('builds Japanese grid cells by kana units', () => {
    const japaneseLevel: Level = {
      ...level,
      language: 'ja',
      letters: ['さ', 'く', 'ら', 'も'],
      mainWords: [{ word: 'さくら', row: 0, col: 0, direction: 'across' }],
      bonusWords: [],
    };

    const cells = buildGrid(japaneseLevel.mainWords, japaneseLevel.language);
    expect(cells.map((cell) => cell.letter)).toEqual(['さ', 'く', 'ら']);
  });

  it('builds Korean grid cells by syllable block units', () => {
    const koreanLevel: Level = {
      ...level,
      language: 'ko',
      letters: ['하', '늘', '봄', '가'],
      mainWords: [{ word: '하늘', row: 0, col: 0, direction: 'across' }],
      bonusWords: [],
    };

    const cells = buildGrid(koreanLevel.mainWords, koreanLevel.language);
    expect(cells.map((cell) => cell.letter)).toEqual(['하', '늘']);
  });

  it('accepts main words', () => {
    expect(validateGuess(level, 'star', new Set(), new Set()).status).toBe('main');
  });

  it('accepts bonus words', () => {
    expect(validateGuess(level, 'tar', new Set(), new Set()).status).toBe('bonus');
  });

  it('rejects invalid words with a reason', () => {
    expect(validateGuess(level, '', new Set(), new Set())).toEqual({ status: 'invalid', word: '', reason: 'empty' });
    expect(validateGuess(level, 's', new Set(), new Set())).toEqual({ status: 'invalid', word: 'S', reason: 'too-short' });
    expect(validateGuess(level, 'car', new Set(), new Set())).toEqual({ status: 'invalid', word: 'CAR', reason: 'not-in-level' });
  });

  it('detects already found words', () => {
    expect(validateGuess(level, 'star', new Set(['STAR']), new Set()).status).toBe('already-found');
  });

  it('detects level completion', () => {
    expect(isLevelComplete(level, new Set(['STAR', 'ART']))).toBe(true);
  });
});
