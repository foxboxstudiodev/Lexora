import { normalizeWord } from '../game/engine';

export type WheelLetterGenerationInput = {
  primaryWord: string;
  words: string[];
  minWheelLetters: number;
  maxWheelLetters: number;
  fillerLetters: string[];
  seed: string;
};

function hashText(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededIndex(seed: string, index: number, length: number): number {
  if (length <= 1) return 0;
  return hashText(`${seed}:${index}`) % length;
}

function countLetters(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of Array.from(normalizeWord(word))) {
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }
  return counts;
}

function getRequiredLetters(words: string[]): string[] {
  const requiredCounts = new Map<string, number>();

  for (const word of words) {
    for (const [letter, count] of countLetters(word)) {
      requiredCounts.set(letter, Math.max(requiredCounts.get(letter) ?? 0, count));
    }
  }

  return Array.from(requiredCounts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([letter, count]) => Array.from({ length: count }, () => letter));
}

function deterministicShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = seededIndex(seed, index, index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isPrimaryOrdered(letters: string[], primaryWord: string): boolean {
  const primary = normalizeWord(primaryWord);
  const ordered = normalizeWord(letters.join(''));
  const reversed = normalizeWord([...letters].reverse().join(''));
  return primary.length > 0 && (ordered === primary || reversed === primary);
}

function rotateOnce<T>(items: T[]): T[] {
  if (items.length <= 1) return [...items];
  return [...items.slice(1), items[0]];
}

export function generateWheelLetters(input: WheelLetterGenerationInput): string[] {
  const minWheelLetters = Math.max(1, input.minWheelLetters);
  const maxWheelLetters = Math.max(minWheelLetters, input.maxWheelLetters);
  const normalizedWords = input.words.map(normalizeWord).filter(Boolean);
  const requiredLetters = getRequiredLetters(normalizedWords);
  const fillerPool = input.fillerLetters.map(normalizeWord).filter(Boolean);
  const targetSize = Math.max(minWheelLetters, Math.min(maxWheelLetters, requiredLetters.length));
  const letters = [...requiredLetters];

  let fillerIndex = 0;
  while (letters.length < targetSize && fillerPool.length > 0) {
    const filler = fillerPool[fillerIndex % fillerPool.length];
    letters.push(filler);
    fillerIndex += 1;
  }

  let shuffled = deterministicShuffle(letters, input.seed);

  for (let attempt = 0; attempt < shuffled.length; attempt += 1) {
    if (!isPrimaryOrdered(shuffled, input.primaryWord)) return shuffled;
    shuffled = rotateOnce(shuffled);
  }

  return shuffled;
}

export function canBuildWordFromWheel(word: string, wheelLetters: string[]): boolean {
  const pool = wheelLetters.map(normalizeWord);
  for (const letter of Array.from(normalizeWord(word))) {
    const index = pool.indexOf(letter);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}
