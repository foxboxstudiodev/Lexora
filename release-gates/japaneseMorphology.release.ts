import { describe, expect, it } from 'vitest';
import {
  analyzeJapaneseWord,
  analyzeJapaneseWords,
  getJapaneseKnownNouns,
  isJapaneseKnownNoun,
} from '../src/features/i18n/japaneseMorphology';

describe('Japanese morphology release gate', () => {
  it('analyzes Japanese vocabulary safely', () => {
    const mountain = analyzeJapaneseWord('山');

    expect(mountain.normalizedReading).toBe('やま');
    expect(mountain.script).toBe('kanji');
    expect(mountain.lexicalClass).toBe('noun');
    expect(mountain.semanticGroupId).toBe('mountain');
  });

  it('supports mixed Japanese morphology analysis', () => {
    const tokens = analyzeJapaneseWords(['ねこ', 'ゲーム', '山']);

    expect(tokens.length).toBe(3);
    expect(tokens.some((token) => token.script === 'hiragana')).toBe(true);
    expect(tokens.some((token) => token.script === 'katakana')).toBe(true);
    expect(tokens.some((token) => token.script === 'kanji')).toBe(true);
  });

  it('detects known Japanese nouns', () => {
    expect(isJapaneseKnownNoun('山')).toBe(true);
    expect(isJapaneseKnownNoun('ねこ')).toBe(true);
  });

  it('filters known Japanese nouns safely', () => {
    const nouns = getJapaneseKnownNouns(['山', 'ねこ', 'unknown']);

    expect(nouns).toContain('山');
    expect(nouns).toContain('ねこ');
  });
});
