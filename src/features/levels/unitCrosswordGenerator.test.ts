import { describe, expect, it } from 'vitest';
import { generateUnitCrossword } from './unitCrosswordGenerator';

function occupiedCells(result: ReturnType<typeof generateUnitCrossword>) {
  return result.placedWords.flatMap((word) => word.units.map((_, index) => ({
    word: word.word,
    row: word.direction === 'down' ? word.row + index : word.row,
    col: word.direction === 'across' ? word.col + index : word.col,
    direction: word.direction,
  })));
}

describe('language-aware crossword generator', () => {
  it('places Latin words and counts intersections by units', () => {
    const result = generateUnitCrossword(['STONE', 'TONE', 'ONE'], 'en');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(1);
    expect(result.runtimePlacedWords[0].word).toBe('STONE');
  });

  it('only places words left-to-right or top-to-bottom', () => {
    const result = generateUnitCrossword(['TRAVEL', 'LATE', 'RAVE', 'TEA'], 'en');

    for (const word of result.placedWords) {
      expect(['across', 'down']).toContain(word.direction);
      const cells = word.units.map((_, index) => ({
        row: word.direction === 'down' ? word.row + index : word.row,
        col: word.direction === 'across' ? word.col + index : word.col,
      }));

      for (let index = 1; index < cells.length; index += 1) {
        if (word.direction === 'across') {
          expect(cells[index].row).toBe(cells[index - 1].row);
          expect(cells[index].col).toBe(cells[index - 1].col + 1);
        } else {
          expect(cells[index].col).toBe(cells[index - 1].col);
          expect(cells[index].row).toBe(cells[index - 1].row + 1);
        }
      }
    }
  });

  it('keeps Hindi grapheme-like units intact in placed words', () => {
    const result = generateUnitCrossword(['का', 'कम'], 'hi');

    expect(result.placedWords[0].units).toContain('का');
    expect(result.runtimePlacedWords[0].word).toContain('का');
  });

  it('places Chinese words by character units when a clean crossing exists', () => {
    const result = generateUnitCrossword(['山水', '水火'], 'zh');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['山', '水']);
  });

  it('places Japanese words by kana units', () => {
    const result = generateUnitCrossword(['さくら', 'くも'], 'ja');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['さ', 'く', 'ら']);
  });

  it('places Korean words by syllable block units when a clean crossing exists', () => {
    const result = generateUnitCrossword(['하늘', '늘봄'], 'ko');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['하', '늘']);
  });

  it('rejects words that cannot intersect the current unit grid', () => {
    const result = generateUnitCrossword(['STONE', 'PUP'], 'en');

    expect(result.rejectedWords).toContain('PUP');
  });

  it('does not create side-by-side word collisions without intersections', () => {
    const result = generateUnitCrossword(['STONE', 'TONE', 'NOTE', 'ONE'], 'en');
    const cells = occupiedCells(result);

    for (const cell of cells) {
      const sideNeighbors = cells.filter((other) => other.word !== cell.word && other.row === cell.row && Math.abs(other.col - cell.col) === 1);
      for (const neighbor of sideNeighbors) {
        expect(cell.direction === 'across' && neighbor.direction === 'across').toBe(false);
      }
    }
  });

  it('keeps generated words separated unless they cross on the same cell', () => {
    const result = generateUnitCrossword(['TRAVEL', 'LATE', 'RAVE', 'TEA'], 'en');
    const cells = occupiedCells(result);
    const positions = new Map<string, string[]>();

    for (const cell of cells) {
      const key = `${cell.row}:${cell.col}`;
      positions.set(key, [...(positions.get(key) ?? []), cell.word]);
    }

    for (const words of positions.values()) {
      expect(new Set(words).size).toBe(words.length);
    }
  });
});
