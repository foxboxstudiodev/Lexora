import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { getAllLevels, getAllPlayableLevels, getLevelsByLanguage } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';
import { getKnownTravelLocationIds } from '../worlds/travelLocations';

function gameplaySignature(level: ReturnType<typeof getAllPlayableLevels>[number]): string {
  const letters = [...level.letters].sort((a, b) => a.localeCompare(b)).join('|');
  const words = level.mainWords.map((word) => word.word).sort((a, b) => a.localeCompare(b)).join('|');
  return `${letters}::${words}`;
}

describe('levels API', () => {
  it('exposes playable development levels', () => {
    expect(getAllLevels().length).toBeGreaterThan(0);
    expect(getAllPlayableLevels().length).toBeGreaterThan(0);
  });

  it('returns exactly 300 sequential playable levels for every active language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const ids = getAllPlayableLevels()
        .filter((level) => level.language === language)
        .map((level) => level.id)
        .sort((a, b) => a - b);
      const expectedIds = Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => index + 1);

      expect(ids, `${language} must expose exactly ${TARGET_LEVELS_PER_LANGUAGE} levels`).toEqual(expectedIds);
    }
  });

  it('does not repeat adjacent gameplay signatures across all 300 non-Russian levels', () => {
    for (const language of ACTIVE_LANGUAGES.filter((item) => item !== 'ru')) {
      const levels = getLevelsByLanguage(language);

      for (let index = 1; index < levels.length; index += 1) {
        expect(gameplaySignature(levels[index]), `${language} levels ${levels[index - 1].id}-${levels[index].id}`).not.toBe(gameplaySignature(levels[index - 1]));
      }
    }
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

  it('keeps available runtime location ids linked to known travel locations', () => {
    const knownLocationIds = getKnownTravelLocationIds();
    const locationLinkedLevels = getAllPlayableLevels().filter((level) => level.locationId);

    expect(locationLinkedLevels.length).toBeGreaterThan(0);
    for (const level of locationLinkedLevels) {
      expect(knownLocationIds.has(level.locationId as string)).toBe(true);
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