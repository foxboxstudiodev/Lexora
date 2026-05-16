import { describe, expect, it } from 'vitest';
import { contentPipelineIssues, contentPipelineRejectedWords, starterLevels } from './levelPacks';

describe('level packs', () => {
  it('loads starter levels from the playable content pipeline', () => {
    expect(starterLevels).toHaveLength(12);
    expect(starterLevels.map((level) => level.language)).toEqual([
      'en', 'en', 'en',
      'es', 'es', 'es',
      'ru', 'ru', 'ru',
      'tr', 'tr', 'tr',
    ]);
  });

  it('keeps each playable language at starter levels 1 to 3', () => {
    for (const language of ['en', 'es', 'ru', 'tr'] as const) {
      expect(starterLevels.filter((level) => level.language === language).map((level) => level.id)).toEqual([1, 2, 3]);
    }
  });

  it('exposes content pipeline diagnostics', () => {
    expect(Array.isArray(contentPipelineIssues)).toBe(true);
    expect(Array.isArray(contentPipelineRejectedWords)).toBe(true);
  });
});
