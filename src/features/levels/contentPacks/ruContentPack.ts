import { LanguageContentPack } from '../contentPackTypes';

export const ruContentPack: LanguageContentPack = {
  language: 'ru',
  targetLevelCount: 300,
  entries: [
    {
      packLevelNumber: 1,
      words: ['ДОМ', 'МОДА', 'ДАМА'],
      bonusWords: ['АД'],
      locationId: 'eg-giza-pyramids',
      seed: 'ru-pack-1',
    },
    {
      packLevelNumber: 2,
      words: ['РЕКА', 'РАК', 'АРКА'],
      bonusWords: ['КАРА'],
      locationId: 'fr-paris-eiffel',
      seed: 'ru-pack-2',
    },
    {
      packLevelNumber: 3,
      words: ['САД', 'ДАР', 'РАД'],
      bonusWords: ['АД'],
      locationId: 'az-baku-old-city',
      seed: 'ru-pack-3',
    },
  ],
};
