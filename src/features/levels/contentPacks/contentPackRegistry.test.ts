import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../../i18n/languages';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

describe('content pack registry', () => {
  it('exposes all language packs', () => {
    expect(getAvailableContentPackLanguages().sort()).toEqual([...ALL_LANGUAGES].sort());
  });

  it('returns full 300-entry packs', () => {
    for (const language of ALL_LANGUAGES) {
      const pack = getContentPack(language);
      expect(pack?.language).toBe(language);
      expect(pack?.entries).toHaveLength(FULL_PACK_LEVEL_COUNT);
    }
  });
});
