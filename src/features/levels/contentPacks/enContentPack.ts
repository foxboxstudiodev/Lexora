import { LanguageContentPack } from '../contentPackTypes';

export const enContentPack: LanguageContentPack = {
  language: 'en',
  targetLevelCount: 300,
  entries: [
    {
      packLevelNumber: 1,
      words: ['STONE', 'TONE', 'ONE'],
      bonusWords: ['NOTE'],
      locationId: 'eg-giza-pyramids',
      seed: 'en-pack-1',
    },
    {
      packLevelNumber: 2,
      words: ['TRAVEL', 'LATE', 'RAVE'],
      bonusWords: ['EAR', 'TEA'],
      locationId: 'fr-paris-eiffel',
      seed: 'en-pack-2',
    },
    {
      packLevelNumber: 3,
      words: ['GARDEN', 'DANGER', 'RANGE'],
      bonusWords: ['GEAR'],
      locationId: 'jp-kyoto-sakura',
      seed: 'en-pack-3',
    },
  ],
};
