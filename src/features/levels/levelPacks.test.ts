import { describe, expect, it } from 'vitest';
import { FULL_PACK_LEVEL_COUNT } from './difficultyProgression';
import { contentPipelineIssues, contentPipelineRejectedWords, starterLevels } from './levelPacks';

const languages = ['az', 'de', 'en', 'es', 'fr', 'hi', 'it', 'ja', 'ko', 'pt', 'ru', 'tr', 'zh'] as const;

describe('level packs', () => {
  it('loads full runtime levels from the content pipeline', () => {
    expect(starterLevels).toHaveLength(languages.length * FULL_PACK_LEVEL_COUNT);
  });

  it('keeps every language at levels 1 to 300', () => {
    for (const language of languages) {
      const ids = starterLevels.filter((level) => level.language === language).map((level) => level.id);
      expect(ids).toHaveLength(FULL_PACK_LEVEL_COUNT);
      expect(ids[0]).toBe(1);
      expect(ids[299]).toBe(300);
    }
  });

  it('exposes content pipeline diagnostics', () => {
    expect(Array.isArray(contentPipelineIssues)).toBe(true);
    expect(Array.isArray(contentPipelineRejectedWords)).toBe(true);
  });
});
