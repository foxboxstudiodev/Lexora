import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE, languageRegistry } from './languages';

const languages = ['en', 'es', 'ru', 'tr', 'de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko'];

describe('language registry', () => {
  it('tracks the full 13-language target', () => {
    expect(ALL_LANGUAGES).toEqual(languages);
  });

  it('makes every target language active/playable', () => {
    expect(ACTIVE_LANGUAGES).toEqual(languages);
    for (const code of ACTIVE_LANGUAGES) {
      expect(languageRegistry[code].status).toBe('active');
    }
  });

  it('sets 300 levels as the target for every language', () => {
    expect(TARGET_LEVELS_PER_LANGUAGE).toBe(300);
    for (const code of ALL_LANGUAGES) {
      expect(languageRegistry[code].targetLevelCount).toBe(300);
    }
  });

  it('requires at least five wheel letters for every language', () => {
    for (const code of ALL_LANGUAGES) {
      expect(languageRegistry[code].minWheelLetters).toBeGreaterThanOrEqual(5);
    }
  });
});
