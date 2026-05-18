import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES, GLOBAL_MIN_WHEEL_LETTERS } from '../i18n/languages';
import { normalizeLevelWord } from '../game/engine';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

function normalizedMainWords(level: ReturnType<typeof getLevelsByLanguage>[number]): string[] {
  return level.mainWords.map((word) => normalizeLevelWord(word.word, level));
}

function normalizedBonusWords(level: ReturnType<typeof getLevelsByLanguage>[number]): string[] {
  return level.bonusWords.map((word) => normalizeLevelWord(word, level));
}

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

  it('keeps available runtime levels aligned with minimum wheel and word structure', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters.length).toBeGreaterThanOrEqual(GLOBAL_MIN_WHEEL_LETTERS);
        expect(level.mainWords.length).toBeGreaterThanOrEqual(2);
        expect(level.mainWords.every((word) => splitWordIntoUnits(normalizeLevelWord(word.word, level), level.language).length >= 2)).toBe(true);
      }
    }
  });

  it('rejects duplicate main words, duplicate bonus words, and main/bonus overlap inside a level', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        const mainWords = normalizedMainWords(level);
        const bonusWords = normalizedBonusWords(level);
        const mainSet = new Set(mainWords);
        const bonusSet = new Set(bonusWords);

        expect(mainSet.size).toBe(mainWords.length);
        expect(bonusSet.size).toBe(bonusWords.length);
        for (const word of bonusSet) {
          expect(mainSet.has(word)).toBe(false);
        }
      }
    }
  });

  it('keeps placed word directions release-safe in available runtime levels', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        for (const word of level.mainWords) {
          expect(['across', 'down']).toContain(word.direction);
          expect(word.row).toBeGreaterThanOrEqual(0);
          expect(word.col).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
