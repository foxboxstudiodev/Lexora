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

function scoreCandidate(candidate: PlacementCandidate): number {
  return candidate.intersections * 100 - Math.abs(candidate.row) - Math.abs(candidate.col);
}

function canPlaceWord(candidate: PlacementCandidate, placedWords: UnitPlacedWord[]): boolean {
  const map = buildCellMap(placedWords);
  let intersections = 0;

  for (const cell of getWordCells(candidate.units, candidate.row, candidate.col, candidate.direction)) {
    const existing = map.get(cellKey(cell.row, cell.col));
    if (!existing) continue;
    if (existing.unit !== cell.unit) return false;
    intersections += 1;
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

  return candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a))[0] ?? null;
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
