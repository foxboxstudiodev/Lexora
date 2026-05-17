import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../../i18n/languages';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './runtimeContentLevels';

describe('runtime content level export', () => {
  it('builds runtime levels from all registered full packs', () => {
    const result = buildRuntimeLevelsFromRegisteredContentPacks();

    expect(result.levels).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
    for (const language of ALL_LANGUAGES) {
      const ids = result.levels.filter((level) => level.language === language).map((level) => level.id);
      expect(ids).toHaveLength(FULL_PACK_LEVEL_COUNT);
      expect(ids[0]).toBe(1);
      expect(ids[299]).toBe(300);
    }
  });

  it('keeps source and generation issues visible to the caller', () => {
    const result = buildRuntimeLevelsFromRegisteredContentPacks();

    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.rejectedWords)).toBe(true);
  });
});
