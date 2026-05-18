import { splitWordIntoUnits } from '../i18n/wordUnits';
import { Level } from '../levels/types';
import { normalizeLevelWord } from './engine';

export type RevealedLetter = {
  word: string;
  index: number;
};

function getRevealedKeys(revealedLetters: RevealedLetter[]): Set<string> {
  return new Set(revealedLetters.map((item) => `${item.word}:${item.index}`));
}

export function getNextHiddenLetter(level: Level, foundWords: Set<string>, revealedLetters: RevealedLetter[]): RevealedLetter | null {
  const revealedKeys = getRevealedKeys(revealedLetters);

  for (const placed of level.mainWords) {
    const word = normalizeLevelWord(placed.word, level);
    if (foundWords.has(word)) continue;

    const units = splitWordIntoUnits(word, level.language);
    for (let index = 0; index < units.length; index += 1) {
      const key = `${word}:${index}`;
      if (!revealedKeys.has(key)) return { word, index };
    }
  }

  return null;
}

export function getRemainingHiddenLetterCount(level: Level, foundWords: Set<string>, revealedLetters: RevealedLetter[]): number {
  const revealedKeys = getRevealedKeys(revealedLetters);
  let count = 0;

  for (const placed of level.mainWords) {
    const word = normalizeLevelWord(placed.word, level);
    if (foundWords.has(word)) continue;

    const units = splitWordIntoUnits(word, level.language);
    for (let index = 0; index < units.length; index += 1) {
      if (!revealedKeys.has(`${word}:${index}`)) count += 1;
    }
  }

  return count;
}

export function isCellRevealedByHint(cellWords: string[], cellLetter: string, revealedLetters: RevealedLetter[], level?: Level): boolean {
  return cellWords.some((word) => {
    const normalized = level ? normalizeLevelWord(word, level) : word.trim().toUpperCase();
    const units = level ? splitWordIntoUnits(normalized, level.language) : Array.from(normalized);
    const normalizedCell = level ? normalizeLevelWord(cellLetter, level) : cellLetter.trim().toUpperCase();
    return revealedLetters.some((item) => item.word === normalized && units[item.index] === normalizedCell);
  });
}
