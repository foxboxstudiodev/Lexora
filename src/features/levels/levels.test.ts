import { describe, expect, it } from 'vitest';
import { getAllLevels, getAllPlayableLevels } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

describe('levels API', () => {
  it('exposes playable development levels', () => {
    expect(getAllLevels().length).toBeGreaterThan(0);
    expect(getAllPlayableLevels().length).toBeGreaterThan(0);
  });

  it('returns available development levels sorted inside each language', () => {
    const languages = Array.from(new Set(getAllPlayableLevels().map((level) => level.language)));

    for (const language of languages) {
      const ids = getAllPlayableLevels()
        .filter((level) => level.language === language)
        .map((level) => level.id);
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
    }
  });

  it('makes every available runtime main word buildable from its wheel letters', () => {
    for (const level of getAllPlayableLevels()) {
      for (const word of level.mainWords) {
        expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
      }
    }
  });

  it('keeps every available runtime bonus word buildable from its wheel letters', () => {
    for (const level of getAllPlayableLevels()) {
      for (const word of level.bonusWords) {
        expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
      }
    }
  });
});
