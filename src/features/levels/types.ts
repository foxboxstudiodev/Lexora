import { LanguageCode } from '../i18n/languages';

export type Direction = 'across' | 'down';

export type PlacedWord = {
  word: string;
  row: number;
  col: number;
  direction: Direction;
};

export type Level = {
  id: number;
  language: LanguageCode;
  letters: string[];
  mainWords: PlacedWord[];
  bonusWords: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  themeId: string;
  locationId?: string;
  rewardCoins: number;
};
