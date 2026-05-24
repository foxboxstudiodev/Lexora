import { describe, expect, it } from 'vitest';
import {
  analyzeAzerbaijaniWord,
  analyzeAzerbaijaniWords,
  getKnownAzerbaijaniNouns,
  isKnownAzerbaijaniNoun,
} from '../src/features/i18n/azerbaijaniMorphology';

describe('Azerbaijani morphology release gate', () => {
  it('classifies core Azerbaijani nouns correctly', () => {
    expect(isKnownAzerbaijaniNoun('ev')).toBe(true);
    expect(isKnownAzerbaijaniNoun('kitab')).toBe(true);
    expect(isKnownAzerbaijaniNoun('şəhər')).toBe(true);
  });

  it('rejects fake or unsupported Azerbaijani words', () => {
    expect(isKnownAzerbaijaniNoun('qip')).toBe(false);
    expect(isKnownAzerbaijaniNoun('paq')).toBe(false);
  });

  it('analyzes Azerbaijani semantic groups and frequency', () => {
    const token = analyzeAzerbaijaniWord('ev');

    expect(token.lexicalClass).toBe('noun');
    expect(token.frequencyBand).toBe(1);
    expect(token.isBeginnerSafe).toBe(true);
    expect(token.semanticGroupId).toBe('home');
  });

  it('returns only valid Azerbaijani nouns from mixed pools', () => {
    const result = getKnownAzerbaijaniNouns(['ev', 'kitab', 'qip', 'loyal', 'şəhər']);

    expect(result).toContain('ev');
    expect(result).toContain('kitab');
    expect(result).toContain('şəhər');
    expect(result).not.toContain('qip');
    expect(result).not.toContain('loyal');
  });

  it('supports batch Azerbaijani morphology analysis', () => {
    const result = analyzeAzerbaijaniWords(['ev', 'kitab', 'şəhər']);
    expect(result.length).toBe(3);
  });
});
