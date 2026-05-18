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

type LayoutCandidate = {
  placedWords: UnitPlacedWord[];
  rejectedWords: string[];
  intersections: number;
  score: number;
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
  if (cells.length === 0) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };

  return {
    minRow: Math.min(...cells.map((cell) => cell.row)),
    maxRow: Math.max(...cells.map((cell) => cell.row)),
    minCol: Math.min(...cells.map((cell) => cell.col)),
    maxCol: Math.max(...cells.map((cell) => cell.col)),
  };
}

function normalizePlacedCoordinates(placedWords: UnitPlacedWord[]): UnitPlacedWord[] {
  const bounds = getBounds(placedWords);
  const rowOffset = bounds.minRow < 0 ? -bounds.minRow : 0;
  const colOffset = bounds.minCol < 0 ? -bounds.minCol : 0;

  return placedWords.map((word) => ({
    ...word,
    row: word.row + rowOffset,
    col: word.col + colOffset,
  }));
}

function layoutDimensions(placedWords: UnitPlacedWord[]): { width: number; height: number; area: number } {
  const bounds = getBounds(placedWords);
  const width = bounds.maxCol - bounds.minCol + 1;
  const height = bounds.maxRow - bounds.minRow + 1;
  return { width, height, area: width * height };
}

function scoreCandidate(candidate: PlacementCandidate, placedWords: UnitPlacedWord[]): number {
  const nextWords = [
    ...placedWords,
    { word: candidate.word, units: candidate.units, row: candidate.row, col: candidate.col, direction: candidate.direction },
  ];
  const dimensions = layoutDimensions(nextWords);
  const compactnessPenalty = Math.abs(dimensions.width - dimensions.height) * 4 + dimensions.area;
  return candidate.intersections * 160 + candidate.units.length * 8 - compactnessPenalty - Math.abs(candidate.row) - Math.abs(candidate.col);
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

        if (canPlaceWord(candidate, placedWords)) candidates.push(candidate);
      });
    });
  }

  return candidates.sort((a, b) => scoreCandidate(b, placedWords) - scoreCandidate(a, placedWords))[0] ?? null;
}

function countIntersections(placedWords: UnitPlacedWord[]): number {
  const map = buildCellMap(placedWords);
  return Array.from(map.values()).filter((cell) => cell.words.size > 1).length;
}

function scoreLayout(placedWords: UnitPlacedWord[], rejectedWords: string[]): number {
  const normalized = normalizePlacedCoordinates(placedWords);
  const intersections = countIntersections(normalized);
  const dimensions = layoutDimensions(normalized);
  return normalized.length * 10000 + intersections * 1000 - rejectedWords.length * 5000 - dimensions.area * 6 - Math.abs(dimensions.width - dimensions.height) * 15;
}

function buildLayout(unitWords: UnitWord[], startIndex: number, direction: Direction): LayoutCandidate {
  const start = unitWords[startIndex];
  const placedWords: UnitPlacedWord[] = [{ word: start.word, units: start.units, row: 0, col: 0, direction }];
  const remaining = unitWords.filter((_, index) => index !== startIndex);
  const rejectedWords: string[] = [];

  while (remaining.length > 0) {
    const candidates = remaining
      .map((word, index) => ({ word, index, placement: findBestPlacement(word, placedWords) }))
      .filter((item): item is { word: UnitWord; index: number; placement: PlacementCandidate } => item.placement !== null)
      .sort((a, b) => scoreCandidate(b.placement, placedWords) - scoreCandidate(a.placement, placedWords));

    const best = candidates[0];
    if (!best) break;

    placedWords.push({
      word: best.placement.word,
      units: best.placement.units,
      row: best.placement.row,
      col: best.placement.col,
      direction: best.placement.direction,
    });
    remaining.splice(best.index, 1);
  }

  rejectedWords.push(...remaining.map((word) => word.word));
  const normalized = normalizePlacedCoordinates(placedWords);

  return {
    placedWords: normalized,
    rejectedWords,
    intersections: countIntersections(normalized),
    score: scoreLayout(normalized, rejectedWords),
  };
}

export function generateUnitCrossword(words: string[], language: LanguageCode): UnitCrosswordGenerationResult {
  const unitWords = normalizeUnitWords(words, language);

  if (unitWords.length === 0) return { placedWords: [], runtimePlacedWords: [], rejectedWords: [], intersections: 0 };

  const layouts = unitWords.flatMap((_, index) => [buildLayout(unitWords, index, 'across'), buildLayout(unitWords, index, 'down')]);
  const best = layouts.sort((a, b) => b.score - a.score)[0];
  const placedWords = best.placedWords;

  return {
    placedWords,
    runtimePlacedWords: placedWords.map(({ word, row, col, direction }) => ({ word, row, col, direction })),
    rejectedWords: best.rejectedWords,
    intersections: best.intersections,
  };
}
