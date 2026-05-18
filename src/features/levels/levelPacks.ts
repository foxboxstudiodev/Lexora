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

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  if (hasCompleteRuntimeLevelSet(contentBuild.levels)) {
    return contentBuild.levels;
  }

  cachedIssues.push(`Content packs produced ${contentBuild.levels.length}/${REQUIRED_RUNTIME_LEVELS} valid runtime levels. Falling back to seed levels until packs are complete.`);
  return createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds]);
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
