import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

const REQUIRED_RUNTIME_LEVELS = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];

function hasCompleteRuntimeLevelSet(levels: Level[]): boolean {
  if (levels.length !== REQUIRED_RUNTIME_LEVELS) return false;

  return ALL_LANGUAGES.every((language) => {
    const ids = levels.filter((level) => level.language === language).map((level) => level.id).sort((a, b) => a - b);
    return ids.length === TARGET_LEVELS_PER_LANGUAGE && ids.every((id, index) => id === index + 1);
  });
}

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function fillSequentialLevels(levels: Level[]): Level[] {
  const seedFallbackLevels = createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds]);
  const repaired: Level[] = [];

  for (const language of ALL_LANGUAGES) {
    const languageLevels = levels
      .filter((level) => level.language === language)
      .sort((a, b) => a.id - b.id);
    const fallbackLevels = seedFallbackLevels
      .filter((level) => level.language === language)
      .sort((a, b) => a.id - b.id);
    const sourcePool = languageLevels.length > 0 ? languageLevels : fallbackLevels;

    if (sourcePool.length === 0) {
      cachedIssues.push(`No runtime or seed fallback levels available for language ${language}.`);
      continue;
    }

    const byId = new Map(languageLevels.map((level) => [level.id, level]));

    for (let id = 1; id <= TARGET_LEVELS_PER_LANGUAGE; id += 1) {
      const existing = byId.get(id);
      if (existing) {
        repaired.push(existing);
        continue;
      }

      const source = sourcePool[(id - 1) % sourcePool.length];
      repaired.push(cloneLevelForMissingId(source, id));
    }
  }

  return repaired.sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  if (hasCompleteRuntimeLevelSet(contentBuild.levels)) {
    return contentBuild.levels;
  }

  cachedIssues.push(`Content packs produced ${contentBuild.levels.length}/${REQUIRED_RUNTIME_LEVELS} valid runtime levels. Repairing runtime sequence to keep every language at 1-${TARGET_LEVELS_PER_LANGUAGE}.`);
  return fillSequentialLevels(contentBuild.levels);
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) {
    cachedStarterLevels = buildStarterLevels();
  }

  return cachedStarterLevels;
}

export function getContentPipelineIssues(): ContentBuildResult['issues'] {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): ContentBuildResult['rejectedWords'] {
  getStarterLevels();
  return cachedRejectedWords;
}
