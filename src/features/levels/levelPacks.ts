import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { Level } from './types';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

const REQUIRED_RUNTIME_LEVELS = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];

function getMissingLevelIds(levels: Level[], language: string): number[] {
  const ids = new Set(levels.filter((level) => level.language === language).map((level) => level.id));
  return Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => index + 1).filter((id) => !ids.has(id));
}

function hasCompleteRuntimeLevelSet(levels: Level[]): boolean {
  return levels.length === REQUIRED_RUNTIME_LEVELS && ALL_LANGUAGES.every((language) => getMissingLevelIds(levels, language).length === 0);
}

function assertCompleteRuntimeLevelSet(levels: Level[]): void {
  if (hasCompleteRuntimeLevelSet(levels)) return;

  const missing = ALL_LANGUAGES
    .map((language) => `${language}: ${getMissingLevelIds(levels, language).length}`)
    .join(', ');

  throw new Error(`Content packs produced ${levels.length}/${REQUIRED_RUNTIME_LEVELS} levels. Missing by language: ${missing}.`);
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const levels = contentBuild.levels.sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;
  assertCompleteRuntimeLevelSet(levels);

  return levels;
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) cachedStarterLevels = buildStarterLevels();
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
