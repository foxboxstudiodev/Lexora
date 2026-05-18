import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { getAllLevels, getAllPlayableLevels, getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

describe('levels API', () => {
  it('exposes all generated runtime levels', () => {
    expect(getAllLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
    expect(getAllPlayableLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
  });

  it('returns continuous 1-300 levels for every language with no gaps or duplicates', () => {
    const expectedIds = Array.from({ length: FULL_PACK_LEVEL_COUNT }, (_, index) => index + 1);

    for (const language of ALL_LANGUAGES) {
      const ids = getLevelsByLanguage(language).map((level) => level.id);
      expect(ids).toEqual(expectedIds);
      expect(new Set(ids).size).toBe(FULL_PACK_LEVEL_COUNT);
    }
  });

  it('uses exact master-plan wheel and main-word counts for every runtime level', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters).toHaveLength(getWheelUnitCountForLevel(level.id));
        expect(level.mainWords).toHaveLength(getTargetMainWordCountForLevel(level.id));
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
