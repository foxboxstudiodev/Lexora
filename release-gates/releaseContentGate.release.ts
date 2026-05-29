import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../src/features/i18n/languages';
import { auditContentPackSources } from '../src/features/levels/contentPacks/contentSourceAudit';
import { getContentPack } from '../src/features/levels/contentPacks/contentPackRegistry';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from '../src/features/levels/difficultyProgression';
import { getAllPlayableLevels, getLevelsByLanguage } from '../src/features/levels/levels';
import { LEXORA_LEVELS_PER_LANGUAGE } from '../src/features/structure/lexoraStructure';

describe('release content gate', () => {
  it('requires complete 1000-level packs for every language', () => {
    expect(FULL_PACK_LEVEL_COUNT).toBe(LEXORA_LEVELS_PER_LANGUAGE);
    expect(getAllPlayableLevels()).toHaveLength(ALL_LANGUAGES.length * LEXORA_LEVELS_PER_LANGUAGE);
    const expectedIds = Array.from({ length: LEXORA_LEVELS_PER_LANGUAGE }, (_, index) => index + 1);
    for (const language of ALL_LANGUAGES) {
      expect(getLevelsByLanguage(language).map((level) => level.id)).toEqual(expectedIds);
    }
  });

  it('requires every registered content pack to be real manual production content', () => {
    const audit = auditContentPackSources();

    expect(audit).toHaveLength(ALL_LANGUAGES.length);
    for (const item of audit) {
      expect(item.totalEntries, `${item.language} must have a full production content pack`).toBe(LEXORA_LEVELS_PER_LANGUAGE);
      expect(item.manualEntries, `${item.language} must have 1000 manual/real entries`).toBe(LEXORA_LEVELS_PER_LANGUAGE);
      expect(item.seedExpandedEntries, `${item.language} must not contain seed-expanded/fallback content`).toBe(0);
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

  it('requires all active languages to have registered production packs', () => {
    for (const language of ALL_LANGUAGES) {
      const pack = getContentPack(language);
      expect(pack, `${language} content pack must be registered`).not.toBeNull();
      expect(pack?.targetLevelCount).toBe(LEXORA_LEVELS_PER_LANGUAGE);
    }
  });
});
