import { analyzeAzerbaijaniWords } from './azerbaijaniMorphology';
import { AZERBAIJANI_WORD_PATTERN, normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniWheelBalanceReport = {
  score: number;
  warnings: string[];
  uniqueUnitCount: number;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeUnit(unit: string): string {
  return normalizeAzerbaijaniWord(unit).replace(/\s+/g, '');
}

export function scoreAzerbaijaniWheelBalance(units: string[], candidateWords: string[]): AzerbaijaniWheelBalanceReport {
  const cleanUnits = units.map(normalizeUnit).filter(Boolean);
  const uniqueUnitCount = new Set(cleanUnits).size;
  const tokens = analyzeAzerbaijaniWords(candidateWords);
  const warnings: string[] = [];
  let score = 100;

  if (cleanUnits.length < 4) {
    warnings.push('Azerbaijani wheel should contain at least four selectable units.');
    score -= 30;
  }

  if (uniqueUnitCount !== cleanUnits.length) {
    warnings.push('Azerbaijani wheel contains duplicate selectable units.');
    score -= (cleanUnits.length - uniqueUnitCount) * 12;
  }

  const invalidUnits = cleanUnits.filter((unit) => !AZERBAIJANI_WORD_PATTERN.test(unit));
  if (invalidUnits.length > 0) {
    warnings.push(`Azerbaijani wheel contains invalid units: ${invalidUnits.join(', ')}.`);
    score -= invalidUnits.length * 16;
  }

  const unknownCandidates = tokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCandidates > 0) {
    warnings.push(`Azerbaijani wheel candidate pool contains ${unknownCandidates} unknown words.`);
    score -= unknownCandidates * 10;
  }

  const candidateLetters = new Set(candidateWords.flatMap((word) => Array.from(normalizeAzerbaijaniWord(word).replace(/\s+/g, ''))));
  const missingLetters = Array.from(candidateLetters).filter((letter) => !cleanUnits.includes(letter));
  if (missingLetters.length > 0) {
    warnings.push(`Azerbaijani wheel cannot cover candidate letters: ${missingLetters.join(', ')}.`);
    score -= Math.min(35, missingLetters.length * 5);
  }

  return {
    score: clampScore(score),
    warnings,
    uniqueUnitCount,
  };
}

export function isAzerbaijaniWheelBalanced(units: string[], candidateWords: string[], minScore = 80): boolean {
  return scoreAzerbaijaniWheelBalance(units, candidateWords).score >= minScore;
}
