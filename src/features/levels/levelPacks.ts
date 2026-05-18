import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { ruContentPack } from './contentPacks/ruContentPack';
import { expandContentPackToFullTarget } from './contentPacks/fullPackExpander';
import { buildExpansionLevelsFromContentPack } from './contentPackBuilder';
import { expansionLevelsToRuntimeLevels } from './expansionLevelAdapter';
import { buildGeneratedNonRussianLevels } from './generatedNonRussianLevels';
import { Level } from './types';

type PipelineIssues = string[];

type RejectedWords = string[];

const REQUIRED_RUNTIME_LEVELS = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: PipelineIssues = [];
let cachedRejectedWords: RejectedWords = [];

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

function buildRussianRuntimeLevels(): Level[] {
  const result = buildExpansionLevelsFromContentPack(expandContentPackToFullTarget(ruContentPack));
  cachedIssues = result.issues;
  cachedRejectedWords = result.rejectedWords;
  return expansionLevelsToRuntimeLevels(result.levels);
}

function buildStarterLevels(): Level[] {
  const russianLevels = buildRussianRuntimeLevels();
  const generatedNonRussianLevels = buildGeneratedNonRussianLevels();
  const levels = [...russianLevels, ...generatedNonRussianLevels].sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

  assertCompleteRuntimeLevelSet(levels);
  return levels;
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) cachedStarterLevels = buildStarterLevels();
  return cachedStarterLevels;
}

export function getContentPipelineIssues(): PipelineIssues {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): RejectedWords {
  getStarterLevels();
  return cachedRejectedWords;
}
