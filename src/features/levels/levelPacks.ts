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

function hasCompleteRuntimeLevelSet(levels: Level[]): boolean {
  if (levels.length !== REQUIRED_RUNTIME_LEVELS) return false;

  return ALL_LANGUAGES.every((language) => getMissingLevelIds(levels, language).length === 0);
}

function assertCompleteRuntimeLevelSet(levels: Level[]): void {
  const missingMessages = ALL_LANGUAGES
    .map((language) => ({ language, missing: getMissingLevelIds(levels, language) }))
    .filter((item) => item.missing.length > 0)
    .map((item) => `${item.language}: missing ${item.missing.length} levels (${item.missing.slice(0, 20).join(', ')}${item.missing.length > 20 ? '...' : ''})`);

  if (levels.length !== REQUIRED_RUNTIME_LEVELS || missingMessages.length > 0) {
    throw new Error([
      `Runtime generation produced ${levels.length}/${REQUIRED_RUNTIME_LEVELS} levels.`,
      ...missingMessages,
      'Runtime packs must be fixed at source; silent cloning fallback is disabled to prevent repeated gameplay levels.',
    ].join('\n'));
  }
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const russianLevels = contentBuild.levels.filter((level) => level.language === 'ru');
  const generatedNonRussianLevels = buildGeneratedNonRussianLevels();
  const levels = [...russianLevels, ...generatedNonRussianLevels].sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  if (!hasCompleteRuntimeLevelSet(levels)) {
    assertCompleteRuntimeLevelSet(levels);
  }

  return levels;
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
