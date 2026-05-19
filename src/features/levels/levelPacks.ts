import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { buildGeneratedNonRussianLevels } from './generatedNonRussianLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function completeRussianLevels(russianLevels: Level[]): Level[] {
  const fallbackRussianLevels = createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds])
    .filter((level) => level.language === 'ru')
    .sort((a, b) => a.id - b.id);
  const sourcePool = russianLevels.length > 0 ? russianLevels : fallbackRussianLevels;

  if (sourcePool.length === 0) return [];

  const byId = new Map(russianLevels.map((level) => [level.id, level]));

  return Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => {
    const id = index + 1;
    return byId.get(id) ?? cloneLevelForMissingId(sourcePool[index % sourcePool.length], id);
  });
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const russianLevels = completeRussianLevels(contentBuild.levels.filter((level) => level.language === 'ru'));
  const generatedNonRussianLevels = buildGeneratedNonRussianLevels();
  const levels = [...russianLevels, ...generatedNonRussianLevels].sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  const expected = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;
  if (levels.length !== expected) {
    cachedIssues.push(`Runtime level count mismatch: ${levels.length}/${expected}.`);
  }

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
