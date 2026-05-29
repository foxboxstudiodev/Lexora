import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { getKnownTravelLocationIds } from '../worlds/travelLocations';
import { getAllLevels, getAllPlayableLevels } from './levels';
import { canBuildWordFromWheelUnits } from './unitWheelLetterGenerator';

function getSamplePlayableLevels() {
  return ACTIVE_LANGUAGES.flatMap((language) => {
    const levels = getAllPlayableLevels().filter((level) => level.language === language);
    return [levels[0], levels[49], levels[499], levels[999]].filter(Boolean);
  });
}

describe('levels API', () => {
  it('exposes playable development levels', () => {
    expect(getAllLevels().length).toBeGreaterThan(0);
    expect(getAllPlayableLevels().length).toBeGreaterThan(0);
  });

  it('returns exactly 1000 sequential playable levels for every active language', () => {
    const allPlayableLevels = getAllPlayableLevels();

    for (const language of ACTIVE_LANGUAGES) {
      const ids = allPlayableLevels
        .filter((level) => level.language === language)
        .map((level) => level.id)
        .sort((a, b) => a - b);
      const expectedIds = Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => index + 1);

      expect(ids, `${language} must expose exactly ${TARGET_LEVELS_PER_LANGUAGE} levels`).toEqual(expectedIds);
    }
  });

  it('returns available development levels sorted inside each language', () => {
    const allPlayableLevels = getAllPlayableLevels();
    const languages = Array.from(new Set(allPlayableLevels.map((level) => level.language)));

    for (const language of languages) {
      const ids = allPlayableLevels
        .filter((level) => level.language === language)
        .map((level) => level.id);
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
    }
  });

  it('keeps sampled runtime location ids linked to known travel locations', () => {
    const knownLocationIds = getKnownTravelLocationIds();
    const locationLinkedLevels = getSamplePlayableLevels().filter((level) => level.locationId);

    expect(locationLinkedLevels.length).toBeGreaterThan(0);
    for (const level of locationLinkedLevels) {
      expect(knownLocationIds.has(level.locationId as string)).toBe(true);
    }
  });

  it('makes sampled runtime main words buildable from their wheel letters', () => {
    for (const level of getSamplePlayableLevels()) {
      for (const word of level.mainWords) {
        expect(canBuildWordFromWheelUnits(word.word, level.letters, level.language)).toBe(true);
      }
    }
  });

  it('keeps sampled runtime bonus words buildable from their wheel letters', () => {
    for (const level of getSamplePlayableLevels()) {
      for (const word of level.bonusWords) {
        expect(canBuildWordFromWheelUnits(word, level.letters, level.language)).toBe(true);
      }
    }
  });
});
