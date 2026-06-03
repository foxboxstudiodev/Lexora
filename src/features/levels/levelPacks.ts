import { ALL_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import {
  buildRuntimeLevelsForRegisteredLanguage,
  buildRuntimeLevelsForRegisteredLanguageAsync,
  buildRuntimeLevelsFromRegisteredContentPacks,
} from './contentPacks/runtimeContentLevels';
import { buildGeneratedNonRussianLevels } from './generatedNonRussianLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];
const cachedLevelsByLanguage = new Map<LanguageCode, Level[]>();

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function groupLevelsByLanguage(levels: Level[]): Map<LanguageCode, Level[]> {
  const grouped = new Map<LanguageCode, Level[]>();

  for (const level of levels) {
    const existing = grouped.get(level.language) ?? [];
    existing.push(level);
    grouped.set(level.language, existing);
  }

  for (const languageLevels of grouped.values()) {
    languageLevels.sort((a, b) => a.id - b.id);
  }

  return grouped;
}

function buildRussianFallbackLevels(): Level[] {
  return createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds])
    .filter((level) => level.language === 'ru')
    .sort((a, b) => a.id - b.id);
}

function completeLanguageLevels(language: LanguageCode, contentLevels: Level[], fallbackLevels: Level[]): Level[] {
  const sourcePool = contentLevels.length > 0 ? contentLevels : fallbackLevels;

  if (sourcePool.length === 0) return [];

  const byId = new Map(contentLevels.map((level) => [level.id, level]));

  return Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => {
    const id = index + 1;
    return byId.get(id) ?? cloneLevelForMissingId(sourcePool[index % sourcePool.length], id);
  });
}

function buildFallbackLevelsForLanguage(language: LanguageCode): Level[] {
  if (language === 'ru') return buildRussianFallbackLevels();
  return buildGeneratedNonRussianLevels()
    .filter((level) => level.language === language)
    .sort((a, b) => a.id - b.id);
}

function buildStarterLevelsForLanguage(language: LanguageCode): Level[] {
  const contentBuild = buildRuntimeLevelsForRegisteredLanguage(language);
  const fallbackLevels = buildFallbackLevelsForLanguage(language);
  const completedLevels = completeLanguageLevels(language, contentBuild.levels, fallbackLevels)
    .sort((a, b) => a.id - b.id);

  cachedIssues.push(...contentBuild.issues);
  cachedRejectedWords.push(...contentBuild.rejectedWords);

  return completedLevels;
}

async function buildStarterLevelsForLanguageAsync(language: LanguageCode): Promise<Level[]> {
  const contentBuild = await buildRuntimeLevelsForRegisteredLanguageAsync(language);
  const fallbackLevels = buildFallbackLevelsForLanguage(language);
  const completedLevels = completeLanguageLevels(language, contentBuild.levels, fallbackLevels)
    .sort((a, b) => a.id - b.id);

  cachedIssues.push(...contentBuild.issues);
  cachedRejectedWords.push(...contentBuild.rejectedWords);

  return completedLevels;
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const contentByLanguage = groupLevelsByLanguage(contentBuild.levels);
  const generatedByLanguage = groupLevelsByLanguage(buildGeneratedNonRussianLevels());
  const russianFallbackLevels = buildRussianFallbackLevels();

  const levels = ALL_LANGUAGES.flatMap((language) => {
    const contentLevels = contentByLanguage.get(language) ?? [];
    const fallbackLevels = language === 'ru' ? russianFallbackLevels : (generatedByLanguage.get(language) ?? []);
    return completeLanguageLevels(language, contentLevels, fallbackLevels);
  }).sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

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

export function getStarterLevelsByLanguage(language: LanguageCode): Level[] {
  const cached = cachedLevelsByLanguage.get(language);
  if (cached) return cached;

  const levels = buildStarterLevelsForLanguage(language);
  cachedLevelsByLanguage.set(language, levels);
  return levels;
}

export async function getStarterLevelsByLanguageAsync(language: LanguageCode): Promise<Level[]> {
  const cached = cachedLevelsByLanguage.get(language);
  if (cached) return cached;

  const levels = await buildStarterLevelsForLanguageAsync(language);
  cachedLevelsByLanguage.set(language, levels);
  return levels;
}

export function getContentPipelineIssues(): ContentBuildResult['issues'] {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): ContentBuildResult['rejectedWords'] {
  getStarterLevels();
  return cachedRejectedWords;
}
