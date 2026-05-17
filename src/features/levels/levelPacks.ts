import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>['issues'] = [];
let cachedRejectedWords: ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>['rejectedWords'] = [];

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  if (contentBuild.levels.length > 0) {
    return contentBuild.levels;
  }

  return createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds]);
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) {
    cachedStarterLevels = buildStarterLevels();
  }

  return cachedStarterLevels;
}

export function getContentPipelineIssues(): typeof cachedIssues {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): typeof cachedRejectedWords {
  getStarterLevels();
  return cachedRejectedWords;
}

export const starterLevels: Level[] = getStarterLevels();
export const contentPipelineIssues = getContentPipelineIssues();
export const contentPipelineRejectedWords = getContentPipelineRejectedWords();
