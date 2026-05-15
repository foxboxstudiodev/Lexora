import { describe, expect, it } from 'vitest';
import { isLevelComplete, normalizeWord, validateGuess } from './engine';
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
  it('normalizes words', () => {
    expect(normalizeWord(' star ')).toBe('STAR');
    expect(normalizeWord('ёлка')).toBe('ЕЛКА');
  });

  it('accepts main words', () => {
    expect(validateGuess(level, 'star', new Set(), new Set()).status).toBe('main');
  });

  it('accepts bonus words', () => {
    expect(validateGuess(level, 'tar', new Set(), new Set()).status).toBe('bonus');
  });

  it('rejects invalid words', () => {
    expect(validateGuess(level, 'car', new Set(), new Set()).status).toBe('invalid');
  });

  it('detects already found words', () => {
    expect(validateGuess(level, 'star', new Set(['STAR']), new Set()).status).toBe('already-found');
  });

  it('detects level completion', () => {
    expect(isLevelComplete(level, new Set(['STAR', 'ART']))).toBe(true);
  });
});
