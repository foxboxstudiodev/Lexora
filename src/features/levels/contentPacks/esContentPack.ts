import { LanguageContentPack } from '../contentPackTypes';

export const esContentPack: LanguageContentPack = {
  language: 'es',
  targetLevelCount: 300,
  entries: [
    {
      packLevelNumber: 1,
      words: ['CASA', 'ASA', 'SACA'],
      bonusWords: ['SAC'],
      locationId: 'eg-giza-pyramids',
      seed: 'es-pack-1',
    },
    {
      packLevelNumber: 2,
      words: ['RUTA', 'ARTE', 'TARDE'],
      bonusWords: ['ERA'],
      locationId: 'fr-paris-eiffel',
      seed: 'es-pack-2',
    },
    {
      packLevelNumber: 3,
      words: ['JARDIN', 'DAR', 'IR'],
      bonusWords: ['DIA'],
      locationId: 'it-rome-colosseum',
      seed: 'es-pack-3',
    },
  ],
};
