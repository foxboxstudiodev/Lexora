import { Level } from '../levels/types';
import { normalizeWord } from './engine';

export type RevealedLetter = {
  word: string;
  index: number;
};

export function getNextHiddenLetter(level: Level, foundWords: Set<string>, revealedLetters: RevealedLetter[]): RevealedLetter | null {
  const revealedKeys = new Set(revealedLetters.map((item) => `${item.word}:${item.index}`));

  for (const placed of level.mainWords) {
    const word = normalizeWord(placed.word);
    if (foundWords.has(word)) continue;

    for (let index = 0; index < Array.from(word).length; index += 1) {
      const key = `${word}:${index}`;
      if (!revealedKeys.has(key)) return { word, index };
    }
  }

  return null;
}

export function isCellRevealedByHint(cellWords: string[], cellLetter: string, revealedLetters: RevealedLetter[]): boolean {
  return cellWords.some((word) => {
    const normalized = normalizeWord(word);
    const letters = Array.from(normalized);
    return revealedLetters.some((item) => item.word === normalized && letters[item.index] === normalizeWord(cellLetter));
  });
}
