import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { auditContentPackSources } from './contentPacks/contentSourceAudit';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { getAllPlayableLevels, getLevelsByLanguage } from './levels';

describe('release content gate', () => {
  it('requires complete 300-level packs for every language', () => {
    expect(getAllPlayableLevels()).toHaveLength(ALL_LANGUAGES.length * FULL_PACK_LEVEL_COUNT);

    const expectedIds = Array.from({ length: FULL_PACK_LEVEL_COUNT }, (_, index) => index + 1);
    for (const language of ALL_LANGUAGES) {
      expect(getLevelsByLanguage(language).map((level) => level.id)).toEqual(expectedIds);
    }
  });

  it('requires exact master-plan counts for every release level', () => {
    for (const language of ALL_LANGUAGES) {
      for (const level of getLevelsByLanguage(language)) {
        expect(level.letters).toHaveLength(getWheelUnitCountForLevel(level.id));
        expect(level.mainWords).toHaveLength(getTargetMainWordCountForLevel(level.id));
      }
    }
  });

  it('blocks seed-expanded content from release', () => {
    expect(auditContentPackSources().every((item) => item.seedExpandedEntries === 0)).toBe(true);
  });
});
