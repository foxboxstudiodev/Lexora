import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { FULL_PACK_LEVEL_COUNT } from './difficultyProgression';
import { getAllLevels, getAllPlayableLevels, getLevelsByLanguage } from './levels';

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
});
