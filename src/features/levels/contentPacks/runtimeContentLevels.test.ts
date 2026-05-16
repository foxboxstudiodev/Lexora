import { describe, expect, it } from 'vitest';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './runtimeContentLevels';

describe('runtime content level export', () => {
  it('builds playable runtime levels from registered content packs', () => {
    const result = buildRuntimeLevelsFromRegisteredContentPacks();

    expect(result.levels).toHaveLength(12);
    expect(result.levels.map((level) => level.language)).toEqual([
      'en', 'en', 'en',
      'es', 'es', 'es',
      'ru', 'ru', 'ru',
      'tr', 'tr', 'tr',
    ]);
    expect(result.levels.filter((level) => level.language === 'en').map((level) => level.id)).toEqual([1, 2, 3]);
    expect(result.levels.filter((level) => level.language === 'es').map((level) => level.id)).toEqual([1, 2, 3]);
    expect(result.levels.filter((level) => level.language === 'ru').map((level) => level.id)).toEqual([1, 2, 3]);
    expect(result.levels.filter((level) => level.language === 'tr').map((level) => level.id)).toEqual([1, 2, 3]);
  });

  it('keeps source and generation issues visible to the caller', () => {
    const result = buildRuntimeLevelsFromRegisteredContentPacks();

    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.rejectedWords)).toBe(true);
  });
});
