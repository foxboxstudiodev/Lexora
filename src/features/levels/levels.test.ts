import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { FULL_PACK_LEVEL_COUNT, getWheelUnitCountForLevel } from './difficultyProgression';
import { getAllLevels, getAllPlayableLevels, getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

describe('levels API', () => {
  it('exposes all generated runtime levels', () => {
    expect(getAllLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
    expect(getAllPlayableLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
  });

  it('returns 300 levels for every language', () => {
    for (const language of ALL_LANGUAGES) {
      const levels = getLevelsByLanguage(language);
      expect(levels).toHaveLength(FULL_PACK_LEVEL_COUNT);
      expect(levels[0].id).toBe(1);
      expect(levels[299].id).toBe(300);
    }
  });

  it('uses the exact repeating 20-level wheel size progression for every language', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters).toHaveLength(getWheelUnitCountForLevel(level.id));
      }
    }
  });

  it('makes every runtime main word buildable from its wheel letters', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.mainWords) {
          expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });

  it('keeps every runtime bonus word buildable from its wheel letters', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.bonusWords) {
          expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });
});
