import { LanguageCode } from '../i18n/languages';
import { ExpansionDifficultyBand } from './difficultyProgression';
import { Direction, PlacedWord } from './types';

export type TravelBackgroundStyle = 'cartoon-landmark' | 'cartoon-nature' | 'cartoon-city' | 'cartoon-cultural-place';

export type ExpansionLocation = {
  id: string;
  countryCode: string;
  countryName: string;
  locationName: string;
  chapterName: string;
  backgroundPrompt: string;
  backgroundStyle: TravelBackgroundStyle;
};

export type ExpansionPlacedWord = PlacedWord & {
  clue?: string;
  order: number;
};

export type ExpansionLevel = {
  id: number;
  packLevelNumber: number;
  language: LanguageCode;
  letters: string[];
  mainWords: ExpansionPlacedWord[];
  bonusWords: string[];
  difficultyBand: ExpansionDifficultyBand;
  location: ExpansionLocation;
  rewardCoins: number;
  minRequiredIntersections: number;
};

export type ExpansionLevelDraft = Omit<ExpansionLevel, 'id'>;

export type CrosswordPlacementCandidate = {
  word: string;
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
};
