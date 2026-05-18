import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { getAllLevels, getAllPlayableLevels, getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

describe('levels API', () => {
  it('exposes playable levels for every active language during development', () => {
    expect(getAllLevels().length).toBeGreaterThan(0);
    expect(getAllPlayableLevels().length).toBeGreaterThan(0);

    for (const language of ALL_LANGUAGES) {
      expect(getLevelsByLanguage(language).length).toBeGreaterThan(0);
    }
  });

  it('returns levels sorted by visible level number for every language', () => {
    for (const language of ALL_LANGUAGES) {
      const ids = getLevelsByLanguage(language).map((level) => level.id);
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
    }
  });

  it('makes every available runtime main word buildable from its wheel letters', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.mainWords) {
          expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });

  it('keeps every available runtime bonus word buildable from its wheel letters', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.bonusWords) {
          expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });
});
