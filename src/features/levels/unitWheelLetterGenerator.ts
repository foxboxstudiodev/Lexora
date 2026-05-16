import { LanguageCode } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';

export type UnitWheelGenerationInput = {
  language: LanguageCode;
  primaryWord: string;
  words: string[];
  minWheelUnits: number;
  maxWheelUnits: number;
  fillerUnits: string[];
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

function deterministicShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = seededIndex(seed, index, index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function rotateOnce<T>(items: T[]): T[] {
  if (items.length <= 1) return [...items];
  return [...items.slice(1), items[0]];
}

function countUnits(word: string, language: LanguageCode): Map<string, number> {
  const counts = new Map<string, number>();
  for (const unit of splitWordIntoUnits(word, language)) {
    counts.set(unit, (counts.get(unit) ?? 0) + 1);
  }
  return counts;
}

function getRequiredUnits(words: string[], language: LanguageCode): string[] {
  const requiredCounts = new Map<string, number>();

  for (const word of words) {
    for (const [unit, count] of countUnits(word, language)) {
      requiredCounts.set(unit, Math.max(requiredCounts.get(unit) ?? 0, count));
    }
  }

  return Array.from(requiredCounts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([unit, count]) => Array.from({ length: count }, () => unit));
}

function wordFromUnits(units: string[]): string {
  return units.join('');
}

function isPrimaryOrdered(units: string[], primaryWord: string, language: LanguageCode): boolean {
  const primary = wordFromUnits(splitWordIntoUnits(primaryWord, language));
  const ordered = wordFromUnits(units);
  const reversed = wordFromUnits([...units].reverse());
  return primary.length > 0 && (ordered === primary || reversed === primary);
}

export function generateWheelUnits(input: UnitWheelGenerationInput): string[] {
  const minWheelUnits = Math.max(1, input.minWheelUnits);
  const maxWheelUnits = Math.max(minWheelUnits, input.maxWheelUnits);
  const requiredUnits = getRequiredUnits(input.words, input.language);
  const fillerUnits = input.fillerUnits.flatMap((unit) => splitWordIntoUnits(unit, input.language));
  const targetSize = Math.max(minWheelUnits, Math.min(maxWheelUnits, requiredUnits.length));
  const units = [...requiredUnits];

  let fillerIndex = 0;
  while (units.length < targetSize && fillerUnits.length > 0) {
    units.push(fillerUnits[fillerIndex % fillerUnits.length]);
    fillerIndex += 1;
  }

  let shuffled = deterministicShuffle(units, input.seed);

  for (let attempt = 0; attempt < shuffled.length; attempt += 1) {
    if (!isPrimaryOrdered(shuffled, input.primaryWord, input.language)) return shuffled;
    shuffled = rotateOnce(shuffled);
  }

  return shuffled;
}

export function canBuildWordFromWheelUnits(word: string, wheelUnits: string[], language: LanguageCode): boolean {
  const pool = [...wheelUnits];

  for (const unit of splitWordIntoUnits(word, language)) {
    const index = pool.indexOf(unit);
    if (index === -1) return false;
    pool.splice(index, 1);
  }

  return true;
}
