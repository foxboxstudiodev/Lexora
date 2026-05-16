import { buildRuntimeLevelsFromRegisteredContentPacks } from './contentPacks/runtimeContentLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
const fallbackSeedLevels = createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds]);

export const contentPipelineIssues = contentBuild.issues;
export const contentPipelineRejectedWords = contentBuild.rejectedWords;
export const starterLevels: Level[] = contentBuild.levels.length > 0 ? contentBuild.levels : fallbackSeedLevels;
