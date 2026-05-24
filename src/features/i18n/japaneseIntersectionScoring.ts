import { detectJapaneseCollisions } from './japaneseCollision';
import { analyzeJapaneseWords } from './japaneseMorphology';

export type JapaneseIntersectionCandidate = {
  words: string[];
  sharedUnit: string;
};

export type JapaneseIntersectionScore = {
  score: number;
  warnings: string[];
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreJapaneseIntersection(candidate: JapaneseIntersectionCandidate): JapaneseIntersectionScore {
  const warnings: string[] = [];
  const tokens = analyzeJapaneseWords(candidate.words);
  const collisions = detectJapaneseCollisions(candidate.words);
  let score = 100;

  if (candidate.words.length < 2) {
    warnings.push('Japanese intersection requires at least two words.');
    score -= 40;
  }

  if (!candidate.sharedUnit.trim()) {
    warnings.push('Japanese intersection shared unit is empty.');
    score -= 40;
  }

  if (collisions.hasBlockingCollision) {
    warnings.push('Japanese intersection has blocking collisions.');
    score -= 30;
  }

  const unknownCount = tokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCount > 0) {
    warnings.push(`Japanese intersection contains ${unknownCount} unknown words.`);
    score -= unknownCount * 10;
  }

  const sharedUnitAppearsInAllWords = candidate.words.every((word) => word.includes(candidate.sharedUnit));
  if (!sharedUnitAppearsInAllWords) {
    warnings.push('Japanese shared unit does not appear in all candidate words.');
    score -= 25;
  }

  const hasMixedScripts = new Set(tokens.map((token) => token.script)).size > 1;
  if (hasMixedScripts && candidate.sharedUnit.length > 1) {
    warnings.push('Mixed-script Japanese intersections should prefer single-character shared units.');
    score -= 8;
  }

  return {
    score: clampScore(score),
    warnings,
  };
}

export function isJapaneseIntersectionNatural(candidate: JapaneseIntersectionCandidate, minScore = 80): boolean {
  return scoreJapaneseIntersection(candidate).score >= minScore;
}
