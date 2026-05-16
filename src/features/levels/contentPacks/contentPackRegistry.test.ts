import { describe, expect, it } from 'vitest';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

describe('content pack registry', () => {
  it('exposes available content pack languages', () => {
    expect(getAvailableContentPackLanguages()).toEqual(['en']);
  });

  it('returns registered content packs', () => {
    const pack = getContentPack('en');
    expect(pack?.language).toBe('en');
    expect(pack?.entries.length).toBeGreaterThan(0);
  });

  it('returns null for languages without source packs yet', () => {
    expect(getContentPack('de')).toBeNull();
    expect(getContentPack('zh')).toBeNull();
  });
});
