import { ALL_LANGUAGES, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { buildRealNounLevels } from './realNounLevelBuilder';
import { Level } from './types';

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: string[] = [];
let cachedRejectedWords: string[] = [];

function buildStarterLevels(): Level[] {
  const levels = buildRealNounLevels().sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);
  const expected = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;

  cachedIssues = [];
  cachedRejectedWords = [];

  if (levels.length !== expected) {
    cachedIssues.push(`Runtime level count mismatch: ${levels.length}/${expected}.`);
  }

  return levels;
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) cachedStarterLevels = buildStarterLevels();
  return cachedStarterLevels;
}

export function getContentPipelineIssues(): string[] {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): string[] {
  getStarterLevels();
  return cachedRejectedWords;
}
