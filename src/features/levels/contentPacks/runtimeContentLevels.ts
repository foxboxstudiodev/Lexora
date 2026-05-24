import { expansionLevelsToRuntimeLevels } from '../expansionLevelAdapter';
import { findDuplicateRuntimeLevelFingerprints } from '../levelDuplicateGuards';
import { Level } from '../types';
import { buildExpansionLevelsFromContentPack } from '../contentPackBuilder';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

export type RuntimeContentBuildResult = {
  levels: Level[];
  issues: string[];
  rejectedWords: string[];
};

export function buildRuntimeLevelsFromRegisteredContentPacks(): RuntimeContentBuildResult {
  const levels: Level[] = [];
  const issues: string[] = [];
  const rejectedWords: string[] = [];

  for (const language of getAvailableContentPackLanguages()) {
    const pack = getContentPack(language);
    if (!pack) continue;

    const result = buildExpansionLevelsFromContentPack(pack);
    levels.push(...expansionLevelsToRuntimeLevels(result.levels));
    issues.push(...result.issues, ...result.sourceErrors);
    rejectedWords.push(...result.rejectedWords);
  }

  const sortedLevels = levels.sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);
  const duplicateFingerprints = findDuplicateRuntimeLevelFingerprints(sortedLevels);

  if (duplicateFingerprints.length > 0) {
    issues.push(
      ...duplicateFingerprints.map((duplicate) =>
        `Duplicate runtime level fingerprint detected for ${duplicate.language} level ${duplicate.levelId}: ${duplicate.reason}.`,
      ),
    );
  }

  return {
    levels: sortedLevels,
    issues,
    rejectedWords,
  };
}
