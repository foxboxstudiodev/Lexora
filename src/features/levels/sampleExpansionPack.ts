import { createExpansionLevel } from './expansionLevelFactory';
import { expansionLevelsToRuntimeLevels } from './expansionLevelAdapter';
import { ExpansionLevel } from './expansionLevelTypes';
import { Level } from './types';

const sampleInputs = [
  {
    id: 100001,
    packLevelNumber: 1,
    language: 'en' as const,
    words: ['STONE', 'TONE', 'ONE'],
    bonusWords: ['NOTE'],
    locationId: 'eg-giza-pyramids',
    fillerLetters: ['A', 'R', 'L', 'S'],
    seed: 'sample-en-1',
  },
  {
    id: 100002,
    packLevelNumber: 2,
    language: 'en' as const,
    words: ['RIVER', 'EVER', 'VIE'],
    bonusWords: ['IRE'],
    locationId: 'fr-paris-eiffel',
    fillerLetters: ['A', 'N', 'T', 'S'],
    seed: 'sample-en-2',
  },
  {
    id: 100003,
    packLevelNumber: 3,
    language: 'en' as const,
    words: ['GARDEN', 'DANGER', 'RANGE'],
    bonusWords: ['GEAR'],
    locationId: 'jp-kyoto-sakura',
    fillerLetters: ['L', 'S', 'T'],
    seed: 'sample-en-3',
  },
];

export type SampleExpansionPackBuild = {
  expansionLevels: ExpansionLevel[];
  runtimeLevels: Level[];
  issues: string[];
  rejectedWords: string[];
};

export function buildSampleExpansionPack(): SampleExpansionPackBuild {
  const results = sampleInputs.map(createExpansionLevel);
  const expansionLevels = results.flatMap((result) => (result.level ? [result.level] : []));

  return {
    expansionLevels,
    runtimeLevels: expansionLevelsToRuntimeLevels(expansionLevels),
    issues: results.flatMap((result) => result.issues),
    rejectedWords: results.flatMap((result) => result.rejectedWords),
  };
}

export const sampleExpansionPack = buildSampleExpansionPack();
