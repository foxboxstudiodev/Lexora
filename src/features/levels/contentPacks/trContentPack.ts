import { LEXORA_LEVELS_PER_LANGUAGE } from '../../structure/lexoraStructure';
import { LanguageContentPack } from '../contentPackTypes';

export const trContentPack: LanguageContentPack = {
  language: 'tr',
  targetLevelCount: LEXORA_LEVELS_PER_LANGUAGE,
  entries: [
    { packLevelNumber: 1, words: ['EV', 'DEV', 'VEDA'], bonusWords: ['AD'], locationId: 'eg-giza-pyramids', seed: 'tr-pack-1' },
    { packLevelNumber: 2, words: ['YOL', 'OY', 'LOYAL'], bonusWords: ['AL'], locationId: 'fr-paris-eiffel', seed: 'tr-pack-2' },
    { packLevelNumber: 3, words: ['KAPI', 'KIP', 'PAK'], bonusWords: ['IP'], locationId: 'az-baku-old-city', seed: 'tr-pack-3' },
    { packLevelNumber: 4, words: ['IŞIK', 'ŞIK', 'KIŞ'], bonusWords: ['İŞ'], locationId: 'jp-kyoto-sakura', seed: 'tr-pack-4' },
    { packLevelNumber: 5, words: ['NEHIR', 'HER', 'HIR'], bonusWords: ['REN'], locationId: 'it-rome-colosseum', seed: 'tr-pack-5' },
    { packLevelNumber: 6, words: ['BULUT', 'TUL', 'BUT'], bonusWords: ['BU'], locationId: 'br-rio-coast', seed: 'tr-pack-6' },
    { packLevelNumber: 7, words: ['KALE', 'EL', 'KEL'], bonusWords: ['AL'], locationId: 'de-bavaria-castle', seed: 'tr-pack-7' },
    { packLevelNumber: 8, words: ['PAZAR', 'ZAR', 'PARA'], bonusWords: ['AR'], locationId: 'cn-guilin-river', seed: 'tr-pack-8' },
    { packLevelNumber: 9, words: ['SARAY', 'YARA', 'SAY'], bonusWords: ['AY'], locationId: 'kr-seoul-palace', seed: 'tr-pack-9' },
    { packLevelNumber: 10, words: ['GUNES', 'GEN', 'SEN'], bonusWords: ['GUS'], locationId: 'in-jaipur-palace', seed: 'tr-pack-10' },
  ],
};
