import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../src/features/i18n/languages';
import { getAllLevels, getLevelsByLanguage } from '../src/features/levels/levels';
import { getBlockingLevelErrors } from '../src/features/levels/levelValidator';
import { getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from '../src/features/levels/difficultyProgression';
import { Level } from '../src/features/levels/types';

function gameplaySignature(level: Level): string {
  const letters = [...level.letters].sort((a, b) => a.localeCompare(b)).join('|');
  const words = level.mainWords.map((item) => item.word).sort((a, b) => a.localeCompare(b)).join('|');
  return `${letters}::${words}`;
}

describe('runtime level validity release gate', () => {
  it('requires every generated runtime level to have zero blocking validation errors before release', () => {
    for (const level of getAllLevels()) {
      expect(getBlockingLevelErrors(level), `${level.language} level ${level.id}`).toEqual([]);
    }
  });

  it('requires every language to expose exactly 300 sequential runtime levels', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const ids = getLevelsByLanguage(language).map((level) => level.id).sort((a, b) => a - b);
      const expectedIds = Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => index + 1);
      expect(ids, `${language} must expose exactly ${TARGET_LEVELS_PER_LANGUAGE} sequential levels`).toEqual(expectedIds);
    }
  });

  it('requires the exact 20-level difficulty pattern for every language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters.length, `${language} level ${level.id} wheel units`).toBe(getWheelUnitCountForLevel(level.id));
        expect(level.mainWords.length, `${language} level ${level.id} main words`).toBe(getTargetMainWordCountForLevel(level.id));
      }
    }
  });

  it('rejects adjacent repeated gameplay signatures in every non-Russian language', () => {
    for (const language of ACTIVE_LANGUAGES.filter((item) => item !== 'ru')) {
      const levels = getLevelsByLanguage(language);
      for (let index = 1; index < levels.length; index += 1) {
        expect(gameplaySignature(levels[index]), `${language} levels ${levels[index - 1].id}-${levels[index].id}`).not.toBe(gameplaySignature(levels[index - 1]));
      }
    }
  });
});