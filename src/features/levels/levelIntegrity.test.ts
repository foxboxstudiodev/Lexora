import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { getLevelsByLanguage } from './levels';
import { validateLevel } from './levelValidator';

function sampleLevelsForLanguage(language: (typeof ACTIVE_LANGUAGES)[number]) {
  const levels = getLevelsByLanguage(language);
  return [levels[0], levels[49], levels[499], levels[999]].filter(Boolean);
}

describe('level integrity', () => {
  it('has exactly 1000 runtime levels for every active language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      expect(getLevelsByLanguage(language).length).toBe(TARGET_LEVELS_PER_LANGUAGE);
    }
  });

  it('uses consecutive per-language checkpoint level ids', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const levels = getLevelsByLanguage(language);
      expect(levels[0]?.id).toBe(1);
      expect(levels[49]?.id).toBe(50);
      expect(levels[499]?.id).toBe(500);
      expect(levels[999]?.id).toBe(1000);
    }
  });

  it('has no invalid sampled generated levels', () => {
    const errors = ACTIVE_LANGUAGES.flatMap((language) => sampleLevelsForLanguage(language).flatMap(validateLevel));
    expect(errors).toEqual([]);
  });

  it('does not reuse the same main word inside sampled levels for one language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const words = sampleLevelsForLanguage(language).flatMap((level) => level.mainWords.map((item) => item.word));
      expect(new Set(words).size).toBe(words.length);
    }
  });
});
