export const AZERBAIJANI_WORD_PATTERN = /^[A-Za-zÇĞİÖŞÜƏIıçəğıöşüə\s-]+$/u;

export const REJECTED_AZERBAIJANI_WORDS = new Set([
  'qip',
  'paq',
  'şıq',
  'loyal',
  'veda',
  'sən',
  'oy',
  'ad',
  'al',
  'ip',
  'ən',
]);

export function normalizeAzerbaijaniWord(value: string): string {
  return value.trim().toLocaleLowerCase('az-AZ').replace(/\s+/g, ' ');
}

export function isBeginnerAzerbaijaniWord(value: string): boolean {
  const normalized = normalizeAzerbaijaniWord(value);
  return normalized.length >= 2 && AZERBAIJANI_WORD_PATTERN.test(normalized) && !REJECTED_AZERBAIJANI_WORDS.has(normalized);
}

export function assertBeginnerAzerbaijaniWord(value: string): void {
  const normalized = normalizeAzerbaijaniWord(value);

  if (!AZERBAIJANI_WORD_PATTERN.test(normalized)) {
    throw new Error(`Azerbaijani word contains unsupported characters: ${value}`);
  }

  if (normalized.length < 2) {
    throw new Error(`Azerbaijani word must contain at least two characters: ${value}`);
  }

  if (REJECTED_AZERBAIJANI_WORDS.has(normalized)) {
    throw new Error(`Rejected Azerbaijani word is not allowed: ${value}`);
  }
}
