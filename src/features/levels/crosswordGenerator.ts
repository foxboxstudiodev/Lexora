import { normalizeWord } from '../game/engine';
import { Direction, PlacedWord } from './types';

export type CrosswordGenerationResult = {
  placedWords: PlacedWord[];
  rejectedWords: string[];
  intersections: number;
};

type Cell = {
  letter: string;
  words: Set<string>;
};

type PlacementCandidate = {
  word: string;
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

function getWordCells(word: string, row: number, col: number, direction: Direction) {
  return Array.from(word).map((letter, index) => ({
    letter,
    row: direction === 'down' ? row + index : row,
    col: direction === 'across' ? col + index : col,
  }));
}

function buildCellMap(placedWords: PlacedWord[]): Map<string, Cell> {
  const map = new Map<string, Cell>();

  for (const placed of placedWords) {
    const word = normalizeWord(placed.word);
    for (const cell of getWordCells(word, placed.row, placed.col, placed.direction)) {
      const key = cellKey(cell.row, cell.col);
      const existing = map.get(key);
      if (existing) {
        existing.words.add(word);
      } else {
        map.set(key, { letter: cell.letter, words: new Set([word]) });
      }
    }
  }

  return map;
}

function scoreCandidate(candidate: PlacementCandidate): number {
  return candidate.intersections * 100 - Math.abs(candidate.row) - Math.abs(candidate.col);
}

function canPlaceWord(candidate: PlacementCandidate, placedWords: PlacedWord[]): boolean {
  const map = buildCellMap(placedWords);
  let intersections = 0;

  for (const cell of getWordCells(candidate.word, candidate.row, candidate.col, candidate.direction)) {
    const existing = map.get(cellKey(cell.row, cell.col));
    if (!existing) continue;
    if (existing.letter !== cell.letter) return false;
    intersections += 1;
  }

  return intersections === candidate.intersections && intersections > 0;
}

function findBestPlacement(word: string, placedWords: PlacedWord[]): PlacementCandidate | null {
  const normalizedWord = normalizeWord(word);
  const candidates: PlacementCandidate[] = [];

  for (const placed of placedWords) {
    const placedWord = normalizeWord(placed.word);
    const nextDirection = oppositeDirection(placed.direction);

    Array.from(normalizedWord).forEach((candidateLetter, candidateIndex) => {
      Array.from(placedWord).forEach((placedLetter, placedIndex) => {
        if (candidateLetter !== placedLetter) return;

        const intersectionRow = placed.direction === 'down' ? placed.row + placedIndex : placed.row;
        const intersectionCol = placed.direction === 'across' ? placed.col + placedIndex : placed.col;
        const row = nextDirection === 'down' ? intersectionRow - candidateIndex : intersectionRow;
        const col = nextDirection === 'across' ? intersectionCol - candidateIndex : intersectionCol;
        const candidate: PlacementCandidate = {
          word: normalizedWord,
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

function countIntersections(placedWords: PlacedWord[]): number {
  const map = buildCellMap(placedWords);
  return Array.from(map.values()).filter((cell) => cell.words.size > 1).length;
}

export function generateCrossword(words: string[]): CrosswordGenerationResult {
  const normalizedWords = Array.from(new Set(words.map(normalizeWord).filter(Boolean))).sort((a, b) => b.length - a.length || a.localeCompare(b));

  if (normalizedWords.length === 0) {
    return { placedWords: [], rejectedWords: [], intersections: 0 };
  }

  const placedWords: PlacedWord[] = [
    {
      word: normalizedWords[0],
      row: 0,
      col: 0,
      direction: 'across',
    },
  ];
  const rejectedWords: string[] = [];

  for (const word of normalizedWords.slice(1)) {
    const placement = findBestPlacement(word, placedWords);
    if (!placement) {
      rejectedWords.push(word);
      continue;
    }

    placedWords.push({
      word: placement.word,
      row: placement.row,
      col: placement.col,
      direction: placement.direction,
    });
  }

  return {
    placedWords,
    rejectedWords,
    intersections: countIntersections(placedWords),
  };
}
