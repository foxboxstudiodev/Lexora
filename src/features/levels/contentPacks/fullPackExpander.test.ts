import { describe, expect, it } from 'vitest';
import { LEXORA_LEVELS_PER_LANGUAGE } from '../../structure/lexoraStructure';
import { LanguageContentPack } from '../contentPackTypes';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { expandContentPackToFullTarget } from './fullPackExpander';

const pack: LanguageContentPack = {
  language: 'en',
  targetLevelCount: LEXORA_LEVELS_PER_LANGUAGE,
  entries: [
    { packLevelNumber: 1, words: ['STONE', 'TONE', 'ONE'], locationId: 'eg-giza-pyramids', seed: 'a' },
    { packLevelNumber: 2, words: ['TRAVEL', 'LATE', 'RAVE'], locationId: 'fr-paris-eiffel', seed: 'b' },
  ],
};

describe('full content pack expander', () => {
  it('expands a seed pack to the full 1000-level target', () => {
    const expanded = expandContentPackToFullTarget(pack);

    expect(expanded.entries).toHaveLength(FULL_PACK_LEVEL_COUNT);
    expect(expanded.entries[0].packLevelNumber).toBe(1);
    expect(expanded.entries[LEXORA_LEVELS_PER_LANGUAGE - 1].packLevelNumber).toBe(LEXORA_LEVELS_PER_LANGUAGE);
    expect(new Set(expanded.entries.map((entry) => entry.packLevelNumber))).toHaveLength(FULL_PACK_LEVEL_COUNT);
  });

  it('creates deterministic per-level seeds', () => {
    const expanded = expandContentPackToFullTarget(pack);

    expect(expanded.entries[0].seed).toBe('en-full-1');
    expect(expanded.entries[LEXORA_LEVELS_PER_LANGUAGE - 1].seed).toBe(`en-full-${LEXORA_LEVELS_PER_LANGUAGE}`);
  });
});
