import { describe, expect, it } from 'vitest';
import { getAllLevels, getLevelsByLanguage } from './levels';
import { validateLevel } from './levelValidator';
import { LanguageCode } from '../i18n/translations';

const languages: LanguageCode[] = ['en', 'es', 'ru', 'tr'];

describe('level integrity', () => {
  it('has levels for every supported language', () => {
    for (const language of languages) {
      expect(getLevelsByLanguage(language).length).toBeGreaterThan(0);
    }
  });

  it('uses consecutive per-language level ids', () => {
    for (const language of languages) {
      const levels = getLevelsByLanguage(language);
      levels.forEach((level, index) => {
        expect(level.id).toBe(index + 1);
      });
    }
  });

  it('has no invalid generated levels', () => {
    const errors = getAllLevels().flatMap(validateLevel);
    expect(errors).toEqual([]);
  });

  it('does not reuse the same main word inside one language pack', () => {
    for (const language of languages) {
      const words = getLevelsByLanguage(language).flatMap((level) => level.mainWords.map((item) => item.word));
      expect(new Set(words).size).toBe(words.length);
    }
  });
});
