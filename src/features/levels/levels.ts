import { LanguageCode } from '../i18n/translations';
import { Level } from './types';

const levels: Level[] = [
  {
    id: 1,
    language: 'en',
    letters: ['S', 'T', 'A', 'R'],
    mainWords: [
      { word: 'STAR', row: 0, col: 0, direction: 'across' },
      { word: 'ART', row: 0, col: 2, direction: 'down' },
      { word: 'RAT', row: 2, col: 0, direction: 'across' },
    ],
    bonusWords: ['TAR', 'SAT'],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 15,
  },
  {
    id: 2,
    language: 'en',
    letters: ['P', 'L', 'A', 'N', 'E'],
    mainWords: [
      { word: 'PLANE', row: 0, col: 0, direction: 'across' },
      { word: 'LANE', row: 0, col: 1, direction: 'down' },
      { word: 'PEN', row: 2, col: 0, direction: 'across' },
    ],
    bonusWords: ['PLAN', 'LEAN', 'PALE', 'LEAP'],
    difficulty: 'easy',
    themeId: 'dawn-garden',
    rewardCoins: 18,
  },
  {
    id: 1,
    language: 'es',
    letters: ['S', 'O', 'L', 'A'],
    mainWords: [
      { word: 'SOLA', row: 0, col: 0, direction: 'across' },
      { word: 'SOL', row: 0, col: 0, direction: 'down' },
      { word: 'OLA', row: 2, col: 0, direction: 'across' },
    ],
    bonusWords: ['LAS', 'SAL'],
    difficulty: 'easy',
    themeId: 'sunny-coast',
    rewardCoins: 15,
  },
  {
    id: 2,
    language: 'es',
    letters: ['M', 'A', 'R', 'E', 'S'],
    mainWords: [
      { word: 'MARES', row: 0, col: 0, direction: 'across' },
      { word: 'MAR', row: 0, col: 0, direction: 'down' },
      { word: 'REMA', row: 1, col: 2, direction: 'down' },
    ],
    bonusWords: ['MAS', 'SER', 'ESA'],
    difficulty: 'easy',
    themeId: 'sunny-coast',
    rewardCoins: 18,
  },
  {
    id: 1,
    language: 'ru',
    letters: ['Л', 'Е', 'С', 'А'],
    mainWords: [
      { word: 'ЛЕСА', row: 0, col: 0, direction: 'across' },
      { word: 'ЛЕС', row: 0, col: 0, direction: 'down' },
      { word: 'СЕЛ', row: 2, col: 0, direction: 'across' },
    ],
    bonusWords: ['ЕЛА', 'САЛ'],
    difficulty: 'easy',
    themeId: 'mystic-forest',
    rewardCoins: 15,
  },
  {
    id: 2,
    language: 'ru',
    letters: ['М', 'О', 'Р', 'Е'],
    mainWords: [
      { word: 'МОРЕ', row: 0, col: 0, direction: 'across' },
      { word: 'МОР', row: 0, col: 0, direction: 'down' },
      { word: 'РОМ', row: 2, col: 0, direction: 'across' },
    ],
    bonusWords: ['ОРЕ', 'РЕМ'],
    difficulty: 'easy',
    themeId: 'crystal-lake',
    rewardCoins: 18,
  },
  {
    id: 1,
    language: 'tr',
    letters: ['K', 'A', 'L', 'E'],
    mainWords: [
      { word: 'KALE', row: 0, col: 0, direction: 'across' },
      { word: 'KAL', row: 0, col: 0, direction: 'down' },
      { word: 'EL', row: 2, col: 2, direction: 'across' },
    ],
    bonusWords: ['AL', 'LAK'],
    difficulty: 'easy',
    themeId: 'ancient-city',
    rewardCoins: 15,
  },
  {
    id: 2,
    language: 'tr',
    letters: ['D', 'E', 'N', 'İ', 'Z'],
    mainWords: [
      { word: 'DENİZ', row: 0, col: 0, direction: 'across' },
      { word: 'DEN', row: 0, col: 0, direction: 'down' },
      { word: 'İZ', row: 3, col: 3, direction: 'across' },
    ],
    bonusWords: ['DİN', 'ZİN'],
    difficulty: 'easy',
    themeId: 'crystal-lake',
    rewardCoins: 18,
  },
];

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return levels.filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}
