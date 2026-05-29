import { describe, expect, it } from 'vitest';
import { LEXORA_LEVELS_PER_LANGUAGE } from '../structure/lexoraStructure';
import { LanguageContentPack } from './contentPackTypes';
import { buildExpansionLevelsFromContentPack } from './contentPackBuilder';

const validPack: LanguageContentPack = {
  language: 'en',
  targetLevelCount: LEXORA_LEVELS_PER_LANGUAGE,
  entries: [
    {
      packLevelNumber: 1,
      words: ['STONE', 'TONE', 'ONE'],
      bonusWords: ['NOTE'],
      locationId: 'eg-giza-pyramids',
    },
    {
      packLevelNumber: 2,
      words: ['TRAVEL', 'LATE', 'RAVE'],
      locationId: 'fr-paris-eiffel',
    },
  ],
};

describe('content pack builder', () => {
  it('builds expansion levels from a valid content pack', () => {
    const result = buildExpansionLevelsFromContentPack(validPack);

    expect(result.levels).toHaveLength(2);
    expect(result.levels.map((level) => level.packLevelNumber)).toEqual([1, 2]);
    expect(result.sourceErrors).toEqual([]);
  });

  it('does not build levels when source validation has blocking errors', () => {
    const result = buildExpansionLevelsFromContentPack({
      ...validPack,
      entries: [{ ...validPack.entries[0], locationId: 'unknown-location' }],
    });

    expect(result.levels).toEqual([]);
    expect(result.sourceErrors.length).toBeGreaterThan(0);
  });

  it('keeps generation quality issues separate from source errors', () => {
    const result = buildExpansionLevelsFromContentPack({
      language: 'en',
      targetLevelCount: LEXORA_LEVELS_PER_LANGUAGE,
      entries: [
        {
          packLevelNumber: 861,
          words: ['STONE', 'TONE', 'ONE'],
          locationId: 'fr-paris-eiffel',
        },
      ],
    });

    expect(result.levels).toHaveLength(1);
    expect(result.sourceErrors).toEqual([]);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
