import { describe, expect, it } from 'vitest';
import { buildGrid } from '../game/engine';
import { generateCrossword } from './crosswordGenerator';

describe('crossword generator', () => {
  it('places the longest word first across', () => {
    const result = generateCrossword(['CAT', 'CART', 'ART']);
    expect(result.placedWords[0]).toMatchObject({ word: 'CART', row: 0, col: 0, direction: 'across' });
  });

  it('creates intersections when words share letters', () => {
    const result = generateCrossword(['CART', 'CAT', 'ART']);
    expect(result.intersections).toBeGreaterThanOrEqual(1);
    expect(result.placedWords.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects words that cannot intersect the current grid', () => {
    const result = generateCrossword(['CART', 'DOG']);
    expect(result.rejectedWords).toContain('DOG');
  });

  it('builds a grid without conflicting letters', () => {
    const result = generateCrossword(['STONE', 'TONE', 'ONE']);
    const cells = buildGrid(result.placedWords);
    const keys = new Set(cells.map((cell) => cell.key));
    expect(keys.size).toBe(cells.length);
  });

  it('deduplicates and normalizes words', () => {
    const result = generateCrossword(['cart', 'CART', 'art']);
    expect(result.placedWords[0].word).toBe('CART');
    expect(result.placedWords.filter((item) => item.word === 'CART')).toHaveLength(1);
  });
});
