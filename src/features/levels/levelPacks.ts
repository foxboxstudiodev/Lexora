import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { buildGeneratedNonRussianLevels } from './generatedNonRussianLevels';
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

function assertCompleteRuntimeLevelSet(levels: Level[]): void {
  const missing = ALL_LANGUAGES.map((language) => getMissingLevelIds(levels, language).length).reduce((sum, value) => sum + value, 0);
  if (levels.length !== REQUIRED_RUNTIME_LEVELS || missing > 0) {
    throw new Error(`Runtime levels incomplete: ${levels.length}/${REQUIRED_RUNTIME_LEVELS}; missing=${missing}.`);
  }
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const russianLevels = contentBuild.levels.filter((level) => level.language === 'ru');
  const generatedNonRussianLevels = buildGeneratedNonRussianLevels();
  const levels = [...russianLevels, ...generatedNonRussianLevels].sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

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
