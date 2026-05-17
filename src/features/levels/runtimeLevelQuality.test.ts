import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { getWheelUnitCountForLevel } from './difficultyProgression';
import { getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

function hasDuplicateCells(level: ReturnType<typeof getLevelsByLanguage>[number]): boolean {
  const seen = new Set<string>();

  for (const word of level.mainWords) {
    for (let index = 0; index < word.word.length; index += 1) {
      const row = word.direction === 'down' ? word.row + index : word.row;
      const col = word.direction === 'across' ? word.col + index : word.col;
      const key = `${row}:${col}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
  }

  return false;
}

describe('runtime level quality gate', () => {
  it('keeps exact wheel count for every runtime level', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters).toHaveLength(getWheelUnitCountForLevel(level.id));
      }
    }
  });

  it('keeps all main and bonus words buildable from their wheel', () => {
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

  it('keeps runtime levels with real crossword words only', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.mainWords.length).toBeGreaterThanOrEqual(2);
        expect(level.mainWords.every((word) => word.word.trim().length > 0)).toBe(true);
        expect(hasDuplicateCells(level)).toBe(false);
      }
    }
  });
});
