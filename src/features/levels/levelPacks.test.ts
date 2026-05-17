import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { FULL_PACK_LEVEL_COUNT } from './difficultyProgression';
import { getContentPipelineIssues, getContentPipelineRejectedWords, getStarterLevels } from './levelPacks';

describe('level packs', () => {
  it('loads full runtime levels from the content pipeline', () => {
    expect(getStarterLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);
  });

  it('keeps every language at levels 1 to 300', () => {
    const starterLevels = getStarterLevels();

    for (const language of ALL_LANGUAGES) {
      const ids = starterLevels.filter((level) => level.language === language).map((level) => level.id);
      expect(ids).toHaveLength(FULL_PACK_LEVEL_COUNT);
      expect(ids[0]).toBe(1);
      expect(ids[299]).toBe(300);
    }
  });

  it('exposes content pipeline diagnostics', () => {
    expect(Array.isArray(getContentPipelineIssues())).toBe(true);
    expect(Array.isArray(getContentPipelineRejectedWords())).toBe(true);
  });
});
