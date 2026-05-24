import { analyzeJapaneseWords } from './japaneseMorphology';
import { getJapaneseScriptBalance } from './japaneseScriptBalance';

export type JapaneseCrosswordNaturalnessReport = {
  score: number;
  warnings: string[];
  scriptBalance: ReturnType<typeof getJapaneseScriptBalance>;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreJapaneseCrosswordNaturalness(words: string[]): JapaneseCrosswordNaturalnessReport {
  const warnings: string[] = [];
  const tokens = analyzeJapaneseWords(words);
  const scriptBalance = getJapaneseScriptBalance(words);
  let score = 100;

  if (words.length < 2) {
    warnings.push('Japanese crossword needs at least two words.');
    score -= 40;
  }

  const unknownCount = tokens.filter((token) => token.lexicalClass === 'unknown').length;
  if (unknownCount > 0) {
    warnings.push(`Japanese crossword contains ${unknownCount} unknown words.`);
    score -= unknownCount * 10;
  }

  const averageLength = words.length === 0 ? 0 : words.reduce((total, word) => total + Array.from(word).length, 0) / words.length;
  if (averageLength < 2) {
    warnings.push('Japanese crossword average word length is too short.');
    score -= 20;
  }

  if (scriptBalance.buckets.other > 0) {
    warnings.push('Japanese crossword contains unsupported script tokens.');
    score -= scriptBalance.buckets.other * 12;
  }

  if (scriptBalance.buckets.kanji > 0 && scriptBalance.buckets.hiragana === 0 && scriptBalance.buckets.katakana === 0) {
    warnings.push('Kanji-only Japanese crossword should include kana support for beginner readability.');
    score -= 10;
  }

  const uniqueWords = new Set(words);
  if (uniqueWords.size !== words.length) {
    warnings.push('Japanese crossword contains duplicate surface words.');
    score -= (words.length - uniqueWords.size) * 12;
  }

  return {
    score: clampScore(score),
    warnings,
    scriptBalance,
  };
}

export function isJapaneseCrosswordNatural(words: string[], minScore = 80): boolean {
  return scoreJapaneseCrosswordNaturalness(words).score >= minScore;
}
