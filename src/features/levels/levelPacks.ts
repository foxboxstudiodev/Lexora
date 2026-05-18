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
  const letters = [...level.letters].sort((a, b) => a.localeCompare(b)).join('');
  const words = level.mainWords.map((word) => word.word).sort((a, b) => a.localeCompare(b)).join('|');
  return `${letters}::${words}`;
}

function difficultyForLevel(id: number): Level['difficulty'] {
  const targetWords = getTargetMainWordCountForLevel(id);
  if (targetWords <= 5) return 'easy';
  if (targetWords <= 12) return 'normal';
  return 'hard';
}

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    difficulty: difficultyForLevel(id),
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function sourceScore(source: Level, id: number, usedSignatures: Set<string>): number {
  const repeatPenalty = usedSignatures.has(levelSignature(source)) ? 100000 : 0;
  const wordDiff = Math.abs(source.mainWords.length - getTargetMainWordCountForLevel(id));
  const letterDiff = Math.abs(source.letters.length - getWheelUnitCountForLevel(id));
  return repeatPenalty + wordDiff * 1000 + letterDiff * 100 + source.id;
}

function pickSource(sourcePool: Level[], id: number, usedSignatures: Set<string>): Level {
  return [...sourcePool].sort((a, b) => sourceScore(a, id, usedSignatures) - sourceScore(b, id, usedSignatures))[0];
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
    const usedSignatures = new Set<string>();

    for (let id = 1; id <= TARGET_LEVELS_PER_LANGUAGE; id += 1) {
      const existing = byId.get(id);
      const existingSignature = existing ? levelSignature(existing) : '';
      const level = existing && !usedSignatures.has(existingSignature)
        ? existing
        : cloneLevelForMissingId(pickSource(sourcePool, id, usedSignatures), id);
      repaired.push(level);
      usedSignatures.add(levelSignature(level));
    }
  }

  return repaired.sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  if (contentBuild.levels.length !== REQUIRED_RUNTIME_LEVELS) {
    cachedIssues.push(`Content packs produced ${contentBuild.levels.length}/${REQUIRED_RUNTIME_LEVELS} runtime levels. Repaired sequence to 1-${TARGET_LEVELS_PER_LANGUAGE}.`);
  }

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
