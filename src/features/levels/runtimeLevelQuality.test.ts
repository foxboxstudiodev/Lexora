import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { getWheelUnitCountForLevel } from './difficultyProgression';
import { getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

type RuntimeLevel = ReturnType<typeof getLevelsByLanguage>[number];
type RuntimeWord = RuntimeLevel['mainWords'][number];
type RuntimeCell = {
  key: string;
  row: number;
  col: number;
  unit: string;
  word: RuntimeWord;
  wordIndex: number;
  cellIndex: number;
};

function getWordCells(level: RuntimeLevel, word: RuntimeWord, wordIndex: number): RuntimeCell[] {
  const units = splitWordIntoUnits(word.word, level.language);
  return units.map((unit, cellIndex) => {
    const row = word.direction === 'down' ? word.row + cellIndex : word.row;
    const col = word.direction === 'across' ? word.col + cellIndex : word.col;
    return {
      key: `${row}:${col}`,
      row,
      col,
      unit,
      word,
      wordIndex,
      cellIndex,
    };
  });
}

function getAllCells(level: RuntimeLevel): RuntimeCell[] {
  return level.mainWords.flatMap((word, wordIndex) => getWordCells(level, word, wordIndex));
}

function buildCellMap(cells: RuntimeCell[]): Map<string, RuntimeCell[]> {
  const map = new Map<string, RuntimeCell[]>();
  for (const cell of cells) {
    map.set(cell.key, [...(map.get(cell.key) ?? []), cell]);
  }
  return map;
}

function isIntersectionCell(cell: RuntimeCell, map: Map<string, RuntimeCell[]>): boolean {
  return (map.get(cell.key) ?? []).some((other) => other.wordIndex !== cell.wordIndex && other.unit === cell.unit);
}

function hasInvalidCellOverlap(level: RuntimeLevel): boolean {
  const map = buildCellMap(getAllCells(level));

  for (const cells of map.values()) {
    const units = new Set(cells.map((cell) => cell.unit));
    if (units.size > 1) return true;

    const directions = new Set(cells.map((cell) => cell.word.direction));
    if (cells.length > 2) return true;
    if (cells.length === 2 && directions.size !== 2) return true;
  }

  return false;
}

function hasInvalidSideCollision(level: RuntimeLevel): boolean {
  const cells = getAllCells(level);
  const map = buildCellMap(cells);

  for (const cell of cells) {
    if (isIntersectionCell(cell, map)) continue;

    const sideKeys = cell.word.direction === 'across'
      ? [`${cell.row - 1}:${cell.col}`, `${cell.row + 1}:${cell.col}`]
      : [`${cell.row}:${cell.col - 1}`, `${cell.row}:${cell.col + 1}`];

    for (const key of sideKeys) {
      const neighbors = map.get(key) ?? [];
      if (neighbors.some((neighbor) => neighbor.wordIndex !== cell.wordIndex)) return true;
    }
  }

  return false;
}

function hasInvalidEndCollision(level: RuntimeLevel): boolean {
  const map = buildCellMap(getAllCells(level));

  for (const word of level.mainWords) {
    const units = splitWordIntoUnits(word.word, level.language);
    const beforeKey = word.direction === 'across'
      ? `${word.row}:${word.col - 1}`
      : `${word.row - 1}:${word.col}`;
    const afterKey = word.direction === 'across'
      ? `${word.row}:${word.col + units.length}`
      : `${word.row + units.length}:${word.col}`;

    if ((map.get(beforeKey) ?? []).some((cell) => cell.word !== word)) return true;
    if ((map.get(afterKey) ?? []).some((cell) => cell.word !== word)) return true;
  }

  return false;
}

function everyWordIntersects(level: RuntimeLevel): boolean {
  const cells = getAllCells(level);
  const map = buildCellMap(cells);

  return level.mainWords.every((_, wordIndex) => cells.some((cell) => cell.wordIndex === wordIndex && isIntersectionCell(cell, map)));
}

describe('runtime level quality gate', () => {
  it('keeps exact wheel count for every runtime level', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters).toHaveLength(getWheelUnitCountForLevel(level.id));
      }
    }
  });

  it('keeps all main and bonus words buildable from their wheel', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.mainWords) {
          expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
        }

        for (const word of level.bonusWords) {
          expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });

  it('keeps runtime levels with real crossword words only', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.mainWords.length).toBeGreaterThanOrEqual(2);
        expect(level.mainWords.every((word) => word.word.trim().length > 0)).toBe(true);
      }
    }
  });

  it('prevents invalid crossword overlaps and cramped collisions', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(hasInvalidCellOverlap(level)).toBe(false);
        expect(hasInvalidSideCollision(level)).toBe(false);
        expect(hasInvalidEndCollision(level)).toBe(false);
      }
    }
  });

  it('requires every runtime crossword word to participate in a real intersection', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(everyWordIntersects(level)).toBe(true);
      }
    }
  });
});
