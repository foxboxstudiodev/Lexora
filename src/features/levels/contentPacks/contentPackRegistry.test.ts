import { describe, expect, it } from 'vitest';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

describe('content pack registry', () => {
  it('exposes available playable content pack languages', () => {
    expect(getAvailableContentPackLanguages().sort()).toEqual(['en', 'es', 'ru', 'tr']);
  });

  it('returns registered playable content packs', () => {
    for (const language of ['en', 'es', 'ru', 'tr'] as const) {
      const pack = getContentPack(language);
      expect(pack?.language).toBe(language);
      expect(pack?.entries.length).toBeGreaterThan(0);
    }
  });

  it('returns null for planned languages without source packs yet', () => {
    expect(getContentPack('de')).toBeNull();
    expect(getContentPack('zh')).toBeNull();
  });
});
