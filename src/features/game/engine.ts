import { splitWordIntoUnits, normalizeWordForLanguage } from '../i18n/wordUnits';
import { Level, PlacedWord } from '../levels/types';

export type GridCell = {
  key: string;
  row: number;
  col: number;
  letter: string;
  words: string[];
};

export type GuessResult =
  | { status: 'main'; word: string }
  | { status: 'bonus'; word: string }
  | { status: 'already-found'; word: string }
  | { status: 'invalid'; word: string };

export function normalizeWord(value: string): string {
  return value.trim().replace(/ё/g, 'е').replace(/Ё/g, 'Е').toUpperCase();
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

  return Array.from(map.values()).sort((a, b) => a.row - b.row || a.col - b.col);
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
  if (splitWordIntoUnits(word, level.language).length < 2) return { status: 'invalid', word };

  const main = level.mainWords.map((item) => normalizeLevelWord(item.word, level));
  const bonus = level.bonusWords.map((item) => normalizeLevelWord(item, level));

  if (foundWords.has(word) || foundBonusWords.has(word)) return { status: 'already-found', word };
  if (main.includes(word)) return { status: 'main', word };
  if (bonus.includes(word)) return { status: 'bonus', word };
  return { status: 'invalid', word };
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
