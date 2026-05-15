import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

export const starterLevels: Level[] = createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds]);
