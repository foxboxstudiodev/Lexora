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

function occupiedPositionSet(result: ReturnType<typeof generateUnitCrossword>): Set<string> {
  return new Set(occupiedCells(result).map((cell) => `${cell.row}:${cell.col}`));
}

function wordsByPosition(result: ReturnType<typeof generateUnitCrossword>): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const cell of occupiedCells(result)) {
    const key = `${cell.row}:${cell.col}`;
    map.set(key, new Set([...(map.get(key) ?? []), cell.word]));
  }
  return map;
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

  it('does not attach extra cells before word starts or after word ends', () => {
    const result = generateUnitCrossword(['TRAVEL', 'LATE', 'RAVE', 'TEA'], 'en');
    const occupied = occupiedPositionSet(result);

    for (const word of result.placedWords) {
      const startBefore = word.direction === 'across'
        ? `${word.row}:${word.col - 1}`
        : `${word.row - 1}:${word.col}`;
      const endAfter = word.direction === 'across'
        ? `${word.row}:${word.col + word.units.length}`
        : `${word.row + word.units.length}:${word.col}`;

      expect(occupied.has(startBefore)).toBe(false);
      expect(occupied.has(endAfter)).toBe(false);
    }
  });

  it('does not allow perpendicular neighbors unless the cell is a real crossing', () => {
    const result = generateUnitCrossword(['TRAVEL', 'LATE', 'RAVE', 'TEA'], 'en');
    const occupied = occupiedPositionSet(result);
    const positionWords = wordsByPosition(result);

    for (const cell of occupiedCells(result)) {
      const currentKey = `${cell.row}:${cell.col}`;
      const isCrossing = (positionWords.get(currentKey)?.size ?? 0) > 1;
      const perpendicularNeighbors = cell.direction === 'across'
        ? [`${cell.row - 1}:${cell.col}`, `${cell.row + 1}:${cell.col}`]
        : [`${cell.row}:${cell.col - 1}`, `${cell.row}:${cell.col + 1}`];

      if (!isCrossing) {
        for (const neighborKey of perpendicularNeighbors) {
          expect(occupied.has(neighborKey)).toBe(false);
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
