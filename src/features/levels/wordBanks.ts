import { LanguageCode } from '../i18n/translations';

export type WordSeed = {
  language: LanguageCode;
  letters: string[];
  mainWords: string[];
  bonusWords: string[];
  themeId: string;
};

export const wordSeeds: WordSeed[] = [
  { language: 'en', letters: ['S', 'T', 'A', 'R'], mainWords: ['STAR', 'ART', 'RAT'], bonusWords: ['TAR', 'SAT'], themeId: 'dawn-garden' },
  { language: 'en', letters: ['P', 'L', 'A', 'N', 'E'], mainWords: ['PLANE', 'LANE', 'PAN'], bonusWords: ['PLAN', 'LEAN', 'PALE', 'LEAP'], themeId: 'dawn-garden' },
  { language: 'en', letters: ['S', 'T', 'O', 'N', 'E'], mainWords: ['STONE', 'TONE', 'NOTE'], bonusWords: ['ONES', 'TOES', 'SENT', 'NEST'], themeId: 'dawn-garden' },
  { language: 'en', letters: ['G', 'A', 'R', 'D', 'E', 'N'], mainWords: ['GARDEN', 'DANGER', 'RANGE'], bonusWords: ['GEAR', 'NEAR', 'DARE', 'READ'], themeId: 'dawn-garden' },
  { language: 'en', letters: ['B', 'R', 'I', 'D', 'G', 'E'], mainWords: ['BRIDGE', 'RIDGE', 'BRIDE'], bonusWords: ['BIRD', 'RIDE', 'GRID'], themeId: 'crystal-lake' },
  { language: 'en', letters: ['F', 'O', 'R', 'E', 'S', 'T'], mainWords: ['FOREST', 'STORE', 'FORTE'], bonusWords: ['SORT', 'ROSE', 'REST'], themeId: 'mystic-forest' },

  { language: 'es', letters: ['S', 'O', 'L', 'A'], mainWords: ['SOLA', 'SOL', 'OLA'], bonusWords: ['LAS', 'SAL'], themeId: 'sunny-coast' },
  { language: 'es', letters: ['M', 'A', 'R', 'E', 'S'], mainWords: ['MARES', 'MAR', 'SER'], bonusWords: ['MAS'], themeId: 'sunny-coast' },
  { language: 'es', letters: ['C', 'A', 'M', 'I', 'N', 'O'], mainWords: ['CAMINO', 'MANO', 'CIMA'], bonusWords: ['AMO', 'COMA'], themeId: 'sunny-coast' },
  { language: 'es', letters: ['P', 'L', 'A', 'Y', 'A'], mainWords: ['PLAYA', 'PALA', 'AYA'], bonusWords: ['ALA', 'YA'], themeId: 'sunny-coast' },
  { language: 'es', letters: ['F', 'L', 'O', 'R', 'E', 'S'], mainWords: ['FLORES', 'FLOR', 'ROLES'], bonusWords: ['SOL', 'SER'], themeId: 'sakura-valley' },
  { language: 'es', letters: ['C', 'A', 'R', 'T', 'A'], mainWords: ['CARTA', 'CARA', 'RATA'], bonusWords: ['ARCA', 'ATAR'], themeId: 'ancient-city' },

  { language: 'ru', letters: ['Л', 'Е', 'С', 'А'], mainWords: ['ЛЕСА', 'ЛЕС', 'ЕЛА'], bonusWords: ['СЕЛ'], themeId: 'mystic-forest' },
  { language: 'ru', letters: ['М', 'О', 'Р', 'Е'], mainWords: ['МОРЕ', 'МОР', 'РОМ'], bonusWords: ['МЕР'], themeId: 'crystal-lake' },
  { language: 'ru', letters: ['К', 'А', 'Р', 'Т', 'А'], mainWords: ['КАРТА', 'КАРА', 'АРКА'], bonusWords: ['АКТ'], themeId: 'ancient-city' },
  { language: 'ru', letters: ['В', 'Е', 'Т', 'Е', 'Р'], mainWords: ['ВЕТЕР', 'ВЕРТ', 'ТЕР'], bonusWords: ['РЕВ'], themeId: 'northern-lights' },
  { language: 'ru', letters: ['Г', 'О', 'Р', 'А'], mainWords: ['ГОРА', 'РОГА', 'АРГО'], bonusWords: ['ОРА'], themeId: 'aurora-peak' },
  { language: 'ru', letters: ['С', 'Т', 'О', 'Л'], mainWords: ['СТОЛ', 'ЛОТ', 'СОЛ'], bonusWords: ['ТОЛ'], themeId: 'ancient-city' },

  { language: 'tr', letters: ['K', 'A', 'L', 'E'], mainWords: ['KALE', 'KAL', 'EL'], bonusWords: ['AL'], themeId: 'ancient-city' },
  { language: 'tr', letters: ['D', 'E', 'N', 'İ', 'Z'], mainWords: ['DENİZ', 'DEN', 'İZ'], bonusWords: ['DİN'], themeId: 'crystal-lake' },
  { language: 'tr', letters: ['K', 'İ', 'T', 'A', 'P'], mainWords: ['KİTAP', 'KİT', 'TAP'], bonusWords: ['KAT', 'KAP', 'İP'], themeId: 'ancient-city' },
  { language: 'tr', letters: ['Y', 'O', 'L', 'C', 'U'], mainWords: ['YOLCU', 'YOL', 'UÇ'], bonusWords: ['OY', 'OL'], themeId: 'sky-temple' },
  { language: 'tr', letters: ['B', 'A', 'H', 'A', 'R'], mainWords: ['BAHAR', 'BAH', 'ARA'], bonusWords: ['HAR', 'BAR'], themeId: 'sakura-valley' },
  { language: 'tr', letters: ['S', 'A', 'R', 'A', 'Y'], mainWords: ['SARAY', 'SARA', 'YAR'], bonusWords: ['SAY', 'AY'], themeId: 'ancient-city' },
];
