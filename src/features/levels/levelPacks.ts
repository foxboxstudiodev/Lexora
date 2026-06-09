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


function uniqueLettersFromWords(words: string[], maxCount: number): string[] {
  const letters: string[] = [];

  for (const word of words) {
    for (const letter of word.toUpperCase()) {
      if (!letters.includes(letter)) letters.push(letter);
      if (letters.length >= maxCount) return letters;
    }
  }

  while (letters.length < maxCount) {
    for (const fallback of ['A', '?', '?', 'R', 'L', 'N', 'S', 'T', 'O', 'U']) {
      if (!letters.includes(fallback)) letters.push(fallback);
      if (letters.length >= maxCount) return letters;
    }
  }

  return letters;
}

function directAzerbaijaniLevel(entry: {
  packLevelNumber: number;
  words: string[];
  bonusWords?: string[];
  locationId: string;
}): Level {
  const id = entry.packLevelNumber;
  const words = Array.from(new Set(entry.words.map((word) => word.trim().toUpperCase()).filter(Boolean)));
  const mainWords = words.slice(0, Math.max(2, Math.min(words.length, 10)));

  return {
    id,
    language: 'az',
    letters: uniqueLettersFromWords(mainWords, Math.min(10, Math.max(4, mainWords[0]?.length ?? 4))),
    mainWords: mainWords.map((word, index) => ({
      word,
      row: index,
      col: 0,
      direction: index % 2 === 0 ? 'across' : 'down',
    })),
    bonusWords: Array.from(new Set((entry.bonusWords ?? []).map((word) => word.trim().toUpperCase()).filter(Boolean))),
    difficulty: id <= 80 ? 'easy' : id <= 220 ? 'normal' : 'hard',
    themeId: 'dawn-garden',
    locationId: entry.locationId,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, mainWords.length - 2) * 2,
  };
}

async function buildDirectAzerbaijaniLevels(): Promise<Level[]> {
  const module = await import('./contentPacks/productionAzerbaijaniPack');
  return module.azContentPack.entries
    .slice()
    .sort((a, b) => a.packLevelNumber - b.packLevelNumber)
    .map(directAzerbaijaniLevel);
}

async function buildStarterLevelsForLanguageAsync(language: LanguageCode): Promise<Level[]> {
  if (language === 'az') {
    return buildDirectAzerbaijaniLevels();
  }

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
