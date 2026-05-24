import { describe, expect, it } from 'vitest';
import {
  analyzeAdvancedAzerbaijaniMorphology,
  getAzerbaijaniLemma,
} from '../src/features/i18n/azerbaijaniAdvancedMorphology';

describe('Advanced Azerbaijani morphology release gate', () => {
  it('extracts Azerbaijani plural lemmas', () => {
    const analysis = analyzeAdvancedAzerbaijaniMorphology('kitablar');

    expect(analysis.lemma).toBe('kitab');
    expect(analysis.features).toContain('plural');
  });

  it('extracts Azerbaijani locative and dative forms', () => {
    const locative = analyzeAdvancedAzerbaijaniMorphology('məktəbdə');
    const dative = analyzeAdvancedAzerbaijaniMorphology('şəhərə');

    expect(locative.features).toContain('case-locative');
    expect(dative.features).toContain('case-dative');
  });

  it('extracts Azerbaijani possessive forms', () => {
    const analysis = analyzeAdvancedAzerbaijaniMorphology('kitabım');

    expect(analysis.features).toContain('possessive-1sg');
  });

  it('returns stable Azerbaijani lemmas', () => {
    expect(getAzerbaijaniLemma('kitablar')).toBe('kitab');
  });
});
