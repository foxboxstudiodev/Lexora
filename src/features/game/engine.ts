import { splitWordIntoUnits, normalizeWordForLanguage } from '../i18n/wordUnits';
import { Level, PlacedWord } from '../levels/types';

export type GridCell = {
  key: string;
  row: number;
  col: number;
  letter: string;
  words: string[];
};

export type InvalidGuessReason = 'empty' | 'too-short' | 'not-in-level';

export type GuessResult =
  | { status: 'main'; word: string }
  | { status: 'bonus'; word: string }
  | { status: 'already-found'; word: string }
  | { status: 'invalid'; word: string; reason: InvalidGuessReason };

export function normalizeWord(value: string): string {
  return value.trim().replace(/ё/g, 'е').replace(/Ё/g, 'Е').toUpperCase();
}

function normalizeGridOrigin(cells: GridCell[]): GridCell[] {
  if (cells.length === 0) return cells;

  const minRow = Math.min(...cells.map((cell) => cell.row));
  const minCol = Math.min(...cells.map((cell) => cell.col));
  const rowOffset = minRow < 0 ? -minRow : 0;
  const colOffset = minCol < 0 ? -minCol : 0;

  return cells.map((cell) => {
    const row = cell.row + rowOffset;
    const col = cell.col + colOffset;
    return { ...cell, row, col, key: `${row}:${col}` };
  });
}

export function buildGrid(words: PlacedWord[], language: Level['language'] = 'en'): GridCell[] {
  const map = new Map<string, GridCell>();

  for (const placed of words) {
    const units = splitWordIntoUnits(placed.word, language);
    units.forEach((letter, index) => {
      const row = placed.direction === 'down' ? placed.row + index : placed.row;
      const col = placed.direction === 'across' ? placed.col + index : placed.col;
      const key = `${row}:${col}`;
      const existing = map.get(key);
      if (existing) {
        existing.words.push(placed.word);
      } else {
        map.set(key, { key, row, col, letter, words: [placed.word] });
      }
    });
  }

  return normalizeGridOrigin(Array.from(map.values())).sort((a, b) => a.row - b.row || a.col - b.col);
}

export function gridBounds(cells: GridCell[]) {
  const maxRow = Math.max(...cells.map((cell) => cell.row), 0);
  const maxCol = Math.max(...cells.map((cell) => cell.col), 0);
  return { rows: maxRow + 1, cols: maxCol + 1 };
}

export function normalizeLevelWord(value: string, level: Level): string {
  return normalizeWordForLanguage(value, level.language).replace(/Ё/g, 'Е');
}

export function validateGuess(level: Level, rawGuess: string, foundWords: Set<string>, foundBonusWords: Set<string>): GuessResult {
  const word = normalizeLevelWord(rawGuess, level);
  const unitLength = splitWordIntoUnits(word, level.language).length;

  if (unitLength === 0) return { status: 'invalid', word, reason: 'empty' };
  if (unitLength < 2) return { status: 'invalid', word, reason: 'too-short' };

  const main = level.mainWords.map((item) => normalizeLevelWord(item.word, level));
  const bonus = level.bonusWords.map((item) => normalizeLevelWord(item, level));

  if (foundWords.has(word) || foundBonusWords.has(word)) return { status: 'already-found', word };
  if (main.includes(word)) return { status: 'main', word };
  if (bonus.includes(word)) return { status: 'bonus', word };
  return { status: 'invalid', word, reason: 'not-in-level' };
}

export function isLevelComplete(level: Level, foundWords: Set<string>): boolean {
  return level.mainWords.every((item) => foundWords.has(normalizeLevelWord(item.word, level)));
}

export function shuffleLetters<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
