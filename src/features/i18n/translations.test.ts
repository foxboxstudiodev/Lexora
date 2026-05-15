import { describe, expect, it } from 'vitest';
import { LanguageCode, translations } from './translations';

const languages: LanguageCode[] = ['en', 'es', 'ru', 'tr'];

describe('translations', () => {
  it('keeps the same label keys for every language', () => {
    const referenceKeys = Object.keys(translations.en).sort();

    for (const language of languages) {
      expect(Object.keys(translations[language]).sort()).toEqual(referenceKeys);
    }
  });

  it('does not contain empty labels', () => {
    for (const language of languages) {
      for (const [key, value] of Object.entries(translations[language])) {
        expect(`${language}.${key}`).toBeTruthy();
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('has all supported language names', () => {
    for (const language of languages) {
      expect(translations[language].languageName.length).toBeGreaterThan(0);
    }
  });
});
