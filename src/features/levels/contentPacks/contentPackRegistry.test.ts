import { describe, expect, it } from 'vitest';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

const languages = ['az', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh'] as const;

describe('content pack registry', () => {
  it('exposes all language packs', () => {
    expect(getAvailableContentPackLanguages().sort()).toEqual([...languages]);
  });

  it('returns full 300-entry packs', () => {
    for (const language of languages) {
      const pack = getContentPack(language);
      expect(pack?.language).toBe(language);
      expect(pack?.entries).toHaveLength(FULL_PACK_LEVEL_COUNT);
    }
  });
});
