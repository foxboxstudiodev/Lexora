import { getJapaneseFrequencyEntry } from './japaneseFrequency';
import { getJapaneseFuriganaToken } from './japaneseFurigana';
import { getJapaneseSemanticGroup } from './japaneseSemanticDuplicates';
import { classifyJapaneseScript, JapaneseScriptBucket } from './japaneseScriptBalance';
import { normalizeJapaneseKana } from './japaneseWordPolicy';

export type JapaneseMorphologyToken = {
  surface: string;
  normalizedReading: string;
  script: JapaneseScriptBucket;
  lexicalClass: 'noun' | 'unknown';
  semanticGroupId?: string;
  frequencyBand: 1 | 2 | 3 | 4 | 5;
};

export function analyzeJapaneseWord(surface: string): JapaneseMorphologyToken {
  const trimmed = surface.trim();
  const furigana = getJapaneseFuriganaToken(trimmed);
  const semanticGroup = getJapaneseSemanticGroup(trimmed);
  const frequency = getJapaneseFrequencyEntry(trimmed);

  return {
    surface: trimmed,
    normalizedReading: furigana?.reading ?? normalizeJapaneseKana(trimmed),
    script: classifyJapaneseScript(trimmed),
    lexicalClass: semanticGroup || frequency.source === 'manual-core-frequency' ? 'noun' : 'unknown',
    semanticGroupId: semanticGroup?.id,
    frequencyBand: frequency.band,
  };
}

export function analyzeJapaneseWords(words: string[]): JapaneseMorphologyToken[] {
  return words.map(analyzeJapaneseWord);
}

export function isJapaneseKnownNoun(surface: string): boolean {
  return analyzeJapaneseWord(surface).lexicalClass === 'noun';
}

export function getJapaneseKnownNouns(words: string[]): string[] {
  return analyzeJapaneseWords(words)
    .filter((token) => token.lexicalClass === 'noun')
    .map((token) => token.surface);
}
