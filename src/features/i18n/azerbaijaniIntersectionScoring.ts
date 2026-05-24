import { analyzeAzerbaijaniWords } from './azerbaijaniMorphology';
import { getAzerbaijaniSemanticDuplicateReport } from './azerbaijaniSemanticDuplicates';
import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniIntersectionCandidate = {
  words: string[];
  sharedUnit: string;
};

export type AzerbaijaniIntersectionScore = {
  score: number;
  warnings: string[];
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreAzerbaijaniIntersection(candidate: AzerbaijaniIntersectionCandidate): AzerbaijaniIntersectionScore {
  const normalizedWords = candidate.words.map(normalizeAzerbaijaniWord).filter(Boolean);
  const sharedUnit = normalizeAzerbaijaniWord(candidate.sharedUnit).replace(/\s+/g, '');
  const tokens = analyzeAzerbaijaniWords(normalizedWords);
  const semanticReport = getAzerbaijaniSemanticDuplicateReport(normalizedWords);
  const warnings: string[] = [];
  let score = 100;

  if (normalizedWords.length < 2) {
    warnings.push('Azerbaijani intersection requires at least two words.');
    score -= 40;
  }

  if (!sharedUnit) {
    warnings.push('Azerbaijani intersection shared unit is empty.');
    score -= 40;
  }

  const unknownCount = tokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCount > 0) {
    warnings.push(`Azerbaijani intersection contains ${unknownCount} unknown words.`);
    score -= unknownCount * 14;
  }

  const sharedUnitAppearsInAllWords = normalizedWords.every((word) => word.includes(sharedUnit));
  if (!sharedUnitAppearsInAllWords) {
    warnings.push('Azerbaijani shared unit does not appear in all candidate words.');
    score -= 30;
  }

  if (sharedUnit.length > 2) {
    warnings.push('Azerbaijani intersections should prefer short shared units.');
    score -= 8;
  }

  if (semanticReport.duplicateGroups.length > 0) {
    warnings.push('Azerbaijani intersection has semantic repetition risk.');
    score -= semanticReport.duplicateGroups.length * 6;
  }

  return {
    score: clampScore(score),
    warnings,
  };
}

export function isAzerbaijaniIntersectionNatural(candidate: AzerbaijaniIntersectionCandidate, minScore = 80): boolean {
  return scoreAzerbaijaniIntersection(candidate).score >= minScore;
}
