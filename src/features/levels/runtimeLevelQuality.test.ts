import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

describe('runtime level quality gate', () => {
  it('keeps all available main and bonus words buildable from their wheel', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.mainWords) {
          expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
        }

        for (const word of level.bonusWords) {
          expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
        }
      }
    }
  });

  it('keeps available runtime levels structurally non-empty during development', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters.length).toBeGreaterThanOrEqual(2);
        expect(level.mainWords.length).toBeGreaterThanOrEqual(1);
        expect(level.mainWords.every((word) => word.word.trim().length > 0)).toBe(true);
      }
    }
  });
});
