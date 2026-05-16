import { describe, expect, it } from 'vitest';
import { contentPipelineIssues, contentPipelineRejectedWords, starterLevels } from './levelPacks';

describe('level packs', () => {
  it('loads starter levels from the content pipeline', () => {
    expect(starterLevels.length).toBeGreaterThanOrEqual(3);
    expect(starterLevels.slice(0, 3).map((level) => level.id)).toEqual([1, 2, 3]);
    expect(starterLevels.slice(0, 3).map((level) => level.language)).toEqual(['en', 'en', 'en']);
  });

  it('exposes content pipeline diagnostics', () => {
    expect(Array.isArray(contentPipelineIssues)).toBe(true);
    expect(Array.isArray(contentPipelineRejectedWords)).toBe(true);
  });
});
