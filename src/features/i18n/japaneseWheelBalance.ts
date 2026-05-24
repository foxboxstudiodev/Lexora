import { analyzeJapaneseWords } from './japaneseMorphology';
import { classifyJapaneseScript, getJapaneseScriptBalance } from './japaneseScriptBalance';

export type JapaneseWheelBalanceReport = {
  score: number;
  warnings: string[];
  uniqueUnitCount: number;
  scriptBalance: ReturnType<typeof getJapaneseScriptBalance>;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreJapaneseWheelBalance(units: string[], candidateWords: string[]): JapaneseWheelBalanceReport {
  const warnings: string[] = [];
  const cleanUnits = units.map((unit) => unit.trim()).filter(Boolean);
  const uniqueUnitCount = new Set(cleanUnits).size;
  const scriptBalance = getJapaneseScriptBalance(cleanUnits);
  const candidateTokens = analyzeJapaneseWords(candidateWords);
  let score = 100;

  if (cleanUnits.length < 4) {
    warnings.push('Japanese wheel should contain at least four selectable units.');
    score -= 30;
  }

  if (uniqueUnitCount !== cleanUnits.length) {
    warnings.push('Japanese wheel contains duplicate selectable units.');
    score -= (cleanUnits.length - uniqueUnitCount) * 12;
  }

  if (scriptBalance.buckets.other > 0) {
    warnings.push('Japanese wheel contains unsupported script units.');
    score -= scriptBalance.buckets.other * 16;
  }

  const kanjiUnits = cleanUnits.filter((unit) => classifyJapaneseScript(unit) === 'kanji').length;
  if (kanjiUnits > 0 && candidateTokens.every((token) => token.script !== 'kanji')) {
    warnings.push('Japanese wheel includes kanji units but candidate words do not need kanji.');
    score -= 12;
  }

  const unknownCandidates = candidateTokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCandidates > 0) {
    warnings.push(`Japanese wheel candidates include ${unknownCandidates} unknown words.`);
    score -= unknownCandidates * 8;
  }

  return {
    score: clampScore(score),
    warnings,
    uniqueUnitCount,
    scriptBalance,
  };
}

export function isJapaneseWheelBalanced(units: string[], candidateWords: string[], minScore = 80): boolean {
  return scoreJapaneseWheelBalance(units, candidateWords).score >= minScore;
}
