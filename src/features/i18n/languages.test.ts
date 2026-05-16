import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, ALL_LANGUAGES, PLANNED_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE, languageRegistry } from './languages';

describe('language registry', () => {
  it('tracks the full 13-language expansion target', () => {
    expect(ALL_LANGUAGES).toHaveLength(13);
  });

  it('keeps current playable languages active', () => {
    expect(ACTIVE_LANGUAGES).toEqual(['en', 'es', 'ru', 'tr']);
    for (const code of ACTIVE_LANGUAGES) {
      expect(languageRegistry[code].status).toBe('active');
    }
  });

  it('tracks planned expansion languages separately', () => {
    expect(PLANNED_LANGUAGES).toEqual(['de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko']);
    for (const code of PLANNED_LANGUAGES) {
      expect(languageRegistry[code].status).toBe('planned');
    }
  });

  it('sets 300 levels as the target for every language', () => {
    expect(TARGET_LEVELS_PER_LANGUAGE).toBe(300);
    for (const code of ALL_LANGUAGES) {
      expect(languageRegistry[code].targetLevelCount).toBe(300);
    }
  });

  it('requires at least five wheel letters for the expansion target', () => {
    for (const code of ALL_LANGUAGES) {
      expect(languageRegistry[code].minWheelLetters).toBeGreaterThanOrEqual(5);
    }
  });
});
