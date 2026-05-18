import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

const REQUIRED_RUNTIME_LEVELS = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];

function levelSignature(level: Level): string {
  return `${level.letters.join('')}::${level.mainWords.map((word) => word.word).join('|')}`;
}

function hasNoAdjacentRepeats(levels: Level[], language: string): boolean {
  const languageLevels = levels.filter((level) => level.language === language).sort((a, b) => a.id - b.id);
  for (let index = 1; index < languageLevels.length; index += 1) {
    if (levelSignature(languageLevels[index]) === levelSignature(languageLevels[index - 1])) return false;
  }
  return true;
}

function hasCompleteRuntimeLevelSet(levels: Level[]): boolean {
  if (levels.length !== REQUIRED_RUNTIME_LEVELS) return false;

  return ALL_LANGUAGES.every((language) => {
    const ids = levels.filter((level) => level.language === language).map((level) => level.id).sort((a, b) => a - b);
    return ids.length === TARGET_LEVELS_PER_LANGUAGE && ids.every((id, index) => id === index + 1) && hasNoAdjacentRepeats(levels, language);
  });
}

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    difficulty: getTargetMainWordCountForLevel(id) <= 5 ? 'easy' : getTargetMainWordCountForLevel(id) <= 12 ? 'normal' : 'hard',
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function sourceScore(source: Level, id: number, previousSignature: string | null): number {
  const sameAsPrevious = previousSignature === levelSignature(source) ? 100000 : 0;
  const wordDiff = Math.abs(source.mainWords.length - getTargetMainWordCountForLevel(id));
  const letterDiff = Math.abs(source.letters.length - getWheelUnitCountForLevel(id));
  return sameAsPrevious + wordDiff * 1000 + letterDiff * 100 + source.id;
}

function pickSource(sourcePool: Level[], id: number, previousSignature: string | null): Level {
  return [...sourcePool].sort((a, b) => sourceScore(a, id, previousSignature) - sourceScore(b, id, previousSignature))[0];
}

function dedupeLevels(levels: Level[]): Level[] {
  const seen = new Set<string>();
  return levels.filter((level) => {
    const signature = levelSignature(level);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
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
    const sourcePool = dedupeLevels([...languageLevels, ...fallbackLevels]);

    if (sourcePool.length === 0) {
      cachedIssues.push(`Missing level source for language ${language}.`);
      continue;
    }

    const byId = new Map(languageLevels.map((level) => [level.id, level]));
    let previousSignature: string | null = null;

    for (let id = 1; id <= TARGET_LEVELS_PER_LANGUAGE; id += 1) {
      const existing = byId.get(id);
      const existingRepeatsPrevious = existing && previousSignature === levelSignature(existing);
      const level = existing && !existingRepeatsPrevious ? existing : cloneLevelForMissingId(pickSource(sourcePool, id, previousSignature), id);
      repaired.push(level);
      previousSignature = levelSignature(level);
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

  cachedIssues.push(`Content packs produced ${contentBuild.levels.length}/${REQUIRED_RUNTIME_LEVELS} runtime levels or adjacent repeats. Repaired sequence to 1-${TARGET_LEVELS_PER_LANGUAGE}.`);
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
