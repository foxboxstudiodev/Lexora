import { scoreAzerbaijaniCrosswordNaturalness } from './azerbaijaniCrosswordNaturalness';
import { scoreAzerbaijaniIntersection, AzerbaijaniIntersectionCandidate } from './azerbaijaniIntersectionScoring';
import { hasAzerbaijaniSemanticOverload } from './azerbaijaniSemanticGraph';
import { scoreAzerbaijaniWheelBalance } from './azerbaijaniWheelBalance';

export type AzerbaijaniGameplayIntelligenceInput = {
  words: string[];
  wheelUnits: string[];
  intersections?: AzerbaijaniIntersectionCandidate[];
};

export type AzerbaijaniGameplayIntelligenceReport = {
  score: number;
  risk: 'low' | 'medium' | 'high';
  warnings: string[];
  components: {
    crossword: number;
    wheel: number;
    intersections: number;
    semantic: number;
  };
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function riskFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score >= 85) return 'low';
  if (score >= 70) return 'medium';
  return 'high';
}

export function scoreAzerbaijaniGameplayIntelligence(
  input: AzerbaijaniGameplayIntelligenceInput,
): AzerbaijaniGameplayIntelligenceReport {
  const crossword = scoreAzerbaijaniCrosswordNaturalness(input.words);
  const wheel = scoreAzerbaijaniWheelBalance(input.wheelUnits, input.words);
  const intersectionScores = (input.intersections ?? []).map(scoreAzerbaijaniIntersection);
  const intersectionAverage = intersectionScores.length === 0
    ? 100
    : intersectionScores.reduce((total, item) => total + item.score, 0) / intersectionScores.length;
  const semanticScore = hasAzerbaijaniSemanticOverload(input.words) ? 72 : 100;

  const score = clampScore(
    crossword.score * 0.35
    + wheel.score * 0.25
    + intersectionAverage * 0.25
    + semanticScore * 0.15,
  );

  const warnings = [
    ...crossword.warnings,
    ...wheel.warnings,
    ...intersectionScores.flatMap((item) => item.warnings),
    ...(semanticScore < 100 ? ['Azerbaijani gameplay has semantic overload risk.'] : []),
  ];

  return {
    score,
    risk: riskFromScore(score),
    warnings,
    components: {
      crossword: crossword.score,
      wheel: wheel.score,
      intersections: clampScore(intersectionAverage),
      semantic: semanticScore,
    },
  };
}

export function isAzerbaijaniGameplayReady(input: AzerbaijaniGameplayIntelligenceInput, minScore = 80): boolean {
  return scoreAzerbaijaniGameplayIntelligence(input).score >= minScore;
}
