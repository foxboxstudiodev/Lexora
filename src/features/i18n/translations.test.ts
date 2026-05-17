import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from './languages';
import { translations } from './translations';

describe('translations', () => {
  it('has labels for every playable language', () => {
    expect(Object.keys(translations).sort()).toEqual([...ALL_LANGUAGES].sort());
  });

  it('keeps the same label keys for every language', () => {
    const referenceKeys = Object.keys(translations.en).sort();

    for (const language of ALL_LANGUAGES) {
      expect(Object.keys(translations[language]).sort()).toEqual(referenceKeys);
    }
  });

  it('does not contain empty labels', () => {
    for (const language of ALL_LANGUAGES) {
      for (const [key, value] of Object.entries(translations[language])) {
        expect(`${language}.${key}`).toBeTruthy();
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('has all supported language names', () => {
    for (const language of ALL_LANGUAGES) {
      expect(translations[language].languageName.length).toBeGreaterThan(0);
    }
  });
});
