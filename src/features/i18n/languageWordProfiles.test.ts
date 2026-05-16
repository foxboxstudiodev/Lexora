import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from './languages';
import { getLanguageWordProfile, languageWordProfiles } from './languageWordProfiles';

describe('language word profiles', () => {
  it('defines a word profile for every roadmap language', () => {
    expect(Object.keys(languageWordProfiles).sort()).toEqual([...ALL_LANGUAGES].sort());
  });

  it('provides filler units for every language', () => {
    for (const language of ALL_LANGUAGES) {
      const profile = getLanguageWordProfile(language);
      expect(profile.fillerUnits.length).toBeGreaterThanOrEqual(5);
      expect(profile.minWordUnits).toBeGreaterThanOrEqual(2);
      expect(profile.maxEarlyWordUnits).toBeGreaterThanOrEqual(profile.minWordUnits);
    }
  });

  it('uses language-specific segmentation for CJK and Hindi', () => {
    expect(getLanguageWordProfile('zh').segmentationMode).toBe('characters');
    expect(getLanguageWordProfile('ja').segmentationMode).toBe('characters');
    expect(getLanguageWordProfile('ko').segmentationMode).toBe('syllable-blocks');
    expect(getLanguageWordProfile('hi').segmentationMode).toBe('graphemes');
  });

  it('preserves special Latin-script language requirements', () => {
    expect(getLanguageWordProfile('az').fillerUnits).toContain('Ə');
    expect(getLanguageWordProfile('tr').fillerUnits).toContain('İ');
  });
});
