import { describe, expect, it } from 'vitest';
import { buildExpansionLevelsFromContentPack } from '../contentPackBuilder';
import { isContentPackValid, validateContentPack } from '../contentPackValidator';
import { enContentPack } from './enContentPack';

describe('English content pack source', () => {
  it('passes source validation', () => {
    const report = validateContentPack(enContentPack);
    expect(report.errorCount).toBe(0);
    expect(isContentPackValid(report)).toBe(true);
  });

  it('builds expansion levels through the content pipeline', () => {
    const result = buildExpansionLevelsFromContentPack(enContentPack);
    expect(result.sourceErrors).toEqual([]);
    expect(result.levels).toHaveLength(enContentPack.entries.length);
    expect(result.levels.map((level) => level.packLevelNumber)).toEqual([1, 2, 3]);
  });
});
