import { describe, expect, it } from 'vitest';
import { LanguageContentPack } from '../contentPackTypes';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { expandContentPackToFullTarget } from './fullPackExpander';

const pack: LanguageContentPack = {
  language: 'en',
  targetLevelCount: 300,
  entries: [
    { packLevelNumber: 1, words: ['STONE', 'TONE', 'ONE'], locationId: 'eg-giza-pyramids', seed: 'a' },
    { packLevelNumber: 2, words: ['TRAVEL', 'LATE', 'RAVE'], locationId: 'fr-paris-eiffel', seed: 'b' },
  ],
};

describe('full content pack expander', () => {
  it('expands a seed pack to the full 300-level target', () => {
    const expanded = expandContentPackToFullTarget(pack);

    expect(expanded.entries).toHaveLength(FULL_PACK_LEVEL_COUNT);
    expect(expanded.entries[0].packLevelNumber).toBe(1);
    expect(expanded.entries[299].packLevelNumber).toBe(300);
    expect(new Set(expanded.entries.map((entry) => entry.packLevelNumber))).toHaveLength(FULL_PACK_LEVEL_COUNT);
  });

  it('creates deterministic per-level seeds', () => {
    const expanded = expandContentPackToFullTarget(pack);

    expect(expanded.entries[0].seed).toBe('en-full-1');
    expect(expanded.entries[299].seed).toBe('en-full-300');
  });
});
