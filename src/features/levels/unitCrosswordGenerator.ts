import { LanguageCode } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { Direction, PlacedWord } from './types';

export type UnitPlacedWord = PlacedWord & {
  units: string[];
};

export type UnitCrosswordGenerationResult = {
  placedWords: UnitPlacedWord[];
  runtimePlacedWords: PlacedWord[];
  rejectedWords: string[];
  intersections: number;
};

type Cell = {
  unit: string;
  words: Set<string>;
};

type UnitWord = {
  word: string;
  units: string[];
};

type PlacementCandidate = {
  word: string;
  units: string[];
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
};

function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function oppositeDirection(direction: Direction): Direction {
  return direction === 'across' ? 'down' : 'across';
}

function normalizeUnitWords(words: string[], language: LanguageCode): UnitWord[] {
  const seen = new Set<string>();
  const result: UnitWord[] = [];

  for (const rawWord of words) {
    const units = splitWordIntoUnits(rawWord, language);
    const word = units.join('');
    if (!word || seen.has(word)) continue;
    seen.add(word);
    result.push({ word, units });
  }

  return result.sort((a, b) => b.units.length - a.units.length || a.word.localeCompare(b.word));
}

function getWordCells(units: string[], row: number, col: number, direction: Direction) {
  return units.map((unit, index) => ({
    unit,
    row: direction === 'down' ? row + index : row,
    col: direction === 'across' ? col + index : col,
  }));
}

function buildCellMap(placedWords: UnitPlacedWord[]): Map<string, Cell> {
  const map = new Map<string, Cell>();

  for (const placed of placedWords) {
    for (const cell of getWordCells(placed.units, placed.row, placed.col, placed.direction)) {
      const key = cellKey(cell.row, cell.col);
      const existing = map.get(key);
      if (existing) {
        existing.words.add(placed.word);
      } else {
        map.set(key, { unit: cell.unit, words: new Set([placed.word]) });
      }
    }
  }

  return map;
}

function getBounds(placedWords: UnitPlacedWord[]): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
  const cells = placedWords.flatMap((word) => getWordCells(word.units, word.row, word.col, word.direction));
  return {
    minRow: Math.min(...cells.map((cell) => cell.row)),
    maxRow: Math.max(...cells.map((cell) => cell.row)),
    minCol: Math.min(...cells.map((cell) => cell.col)),
    maxCol: Math.max(...cells.map((cell) => cell.col)),
  };
}

function scoreCandidate(candidate: PlacementCandidate, placedWords: UnitPlacedWord[]): number {
  const bounds = getBounds([
    ...placedWords,
    {
      word: candidate.word,
      units: candidate.units,
      row: candidate.row,
      col: candidate.col,
      direction: candidate.direction,
    },
  ]);
  const width = bounds.maxCol - bounds.minCol + 1;
  const height = bounds.maxRow - bounds.minRow + 1;
  const compactnessPenalty = Math.abs(width - height) * 4 + (width + height);
  return candidate.intersections * 120 - compactnessPenalty - Math.abs(candidate.row) - Math.abs(candidate.col);
}

function hasSideCollision(cell: { row: number; col: number }, direction: Direction, map: Map<string, Cell>): boolean {
  if (direction === 'across') {
    return map.has(cellKey(cell.row - 1, cell.col)) || map.has(cellKey(cell.row + 1, cell.col));
  }

  return map.has(cellKey(cell.row, cell.col - 1)) || map.has(cellKey(cell.row, cell.col + 1));
}

function hasEndCollision(candidate: PlacementCandidate, map: Map<string, Cell>): boolean {
  if (candidate.direction === 'across') {
    return map.has(cellKey(candidate.row, candidate.col - 1)) || map.has(cellKey(candidate.row, candidate.col + candidate.units.length));
  }

  return map.has(cellKey(candidate.row - 1, candidate.col)) || map.has(cellKey(candidate.row + candidate.units.length, candidate.col));
}

function canPlaceWord(candidate: PlacementCandidate, placedWords: UnitPlacedWord[]): boolean {
  const map = buildCellMap(placedWords);
  let intersections = 0;

  if (hasEndCollision(candidate, map)) return false;

  for (const cell of getWordCells(candidate.units, candidate.row, candidate.col, candidate.direction)) {
    const existing = map.get(cellKey(cell.row, cell.col));

    if (existing) {
      if (existing.unit !== cell.unit) return false;
      intersections += 1;
      continue;
    }

    if (hasSideCollision(cell, candidate.direction, map)) return false;
  }

  return intersections === candidate.intersections && intersections > 0;
}

function findBestPlacement(word: UnitWord, placedWords: UnitPlacedWord[]): PlacementCandidate | null {
  const candidates: PlacementCandidate[] = [];

  for (const placed of placedWords) {
    const nextDirection = oppositeDirection(placed.direction);

    word.units.forEach((candidateUnit, candidateIndex) => {
      placed.units.forEach((placedUnit, placedIndex) => {
        if (candidateUnit !== placedUnit) return;

        const intersectionRow = placed.direction === 'down' ? placed.row + placedIndex : placed.row;
        const intersectionCol = placed.direction === 'across' ? placed.col + placedIndex : placed.col;
        const row = nextDirection === 'down' ? intersectionRow - candidateIndex : intersectionRow;
        const col = nextDirection === 'across' ? intersectionCol - candidateIndex : intersectionCol;
        const candidate: PlacementCandidate = {
          word: word.word,
          units: word.units,
          row,
          col,
          direction: nextDirection,
          intersections: 1,
        };

        if (canPlaceWord(candidate, placedWords)) {
          candidates.push(candidate);
        }
      });
    });
  }

  return candidates.sort((a, b) => scoreCandidate(b, placedWords) - scoreCandidate(a, placedWords))[0] ?? null;
}

function countIntersections(placedWords: UnitPlacedWord[]): number {
  const map = buildCellMap(placedWords);
  return Array.from(map.values()).filter((cell) => cell.words.size > 1).length;
}

export function generateUnitCrossword(words: string[], language: LanguageCode): UnitCrosswordGenerationResult {
  const unitWords = normalizeUnitWords(words, language);

  if (unitWords.length === 0) {
    return { placedWords: [], runtimePlacedWords: [], rejectedWords: [], intersections: 0 };
  }

  const placedWords: UnitPlacedWord[] = [
    {
      word: unitWords[0].word,
      units: unitWords[0].units,
      row: 0,
      col: 0,
      direction: 'across',
    },
  ];
  const rejectedWords: string[] = [];

  for (const word of unitWords.slice(1)) {
    const placement = findBestPlacement(word, placedWords);
    if (!placement) {
      rejectedWords.push(word.word);
      continue;
    }

    placedWords.push({
      word: placement.word,
      units: placement.units,
      row: placement.row,
      col: placement.col,
      direction: placement.direction,
    });
  }

  return {
    placedWords,
    runtimePlacedWords: placedWords.map(({ word, row, col, direction }) => ({ word, row, col, direction })),
    rejectedWords,
    intersections: countIntersections(placedWords),
  };
}
