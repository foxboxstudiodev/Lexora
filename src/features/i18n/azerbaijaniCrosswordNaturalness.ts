import { analyzeAzerbaijaniWords } from './azerbaijaniMorphology';
import { getAzerbaijaniSemanticDuplicateReport } from './azerbaijaniSemanticDuplicates';
import { isBeginnerAzerbaijaniWord, normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniCrosswordNaturalnessReport = {
  score: number;
  warnings: string[];
  duplicateSemanticGroups: number;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreAzerbaijaniCrosswordNaturalness(words: string[]): AzerbaijaniCrosswordNaturalnessReport {
  const normalizedWords = words.map(normalizeAzerbaijaniWord).filter(Boolean);
  const tokens = analyzeAzerbaijaniWords(normalizedWords);
  const semanticReport = getAzerbaijaniSemanticDuplicateReport(normalizedWords);
  const warnings: string[] = [];
  let score = 100;

  if (normalizedWords.length < 2) {
    warnings.push('Azerbaijani crossword needs at least two words.');
    score -= 40;
  }

  const invalidWords = normalizedWords.filter((word) => !isBeginnerAzerbaijaniWord(word));
  if (invalidWords.length > 0) {
    warnings.push(`Azerbaijani crossword contains invalid words: ${invalidWords.join(', ')}.`);
    score -= invalidWords.length * 18;
  }

  const unknownCount = tokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCount > 0) {
    warnings.push(`Azerbaijani crossword contains ${unknownCount} unknown nouns.`);
    score -= unknownCount * 12;
  }

  const uniqueCount = new Set(normalizedWords).size;
  if (uniqueCount !== normalizedWords.length) {
    warnings.push('Azerbaijani crossword contains duplicate surface words.');
    score -= (normalizedWords.length - uniqueCount) * 14;
  }

  if (semanticReport.duplicateGroups.length > 1) {
    warnings.push('Azerbaijani crossword has excessive semantic repetition.');
    score -= semanticReport.duplicateGroups.length * 8;
  }

  const averageLength = normalizedWords.length === 0
    ? 0
    : normalizedWords.reduce((total, word) => total + word.length, 0) / normalizedWords.length;

  if (averageLength < 3) {
    warnings.push('Azerbaijani crossword average word length is too short.');
    score -= 14;
  }

  return {
    score: clampScore(score),
    warnings,
    duplicateSemanticGroups: semanticReport.duplicateGroups.length,
  };
}

export function isAzerbaijaniCrosswordNatural(words: string[], minScore = 80): boolean {
  return scoreAzerbaijaniCrosswordNaturalness(words).score >= minScore;
}
