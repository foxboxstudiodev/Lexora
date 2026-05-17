import { LanguageCode } from '../i18n/languages';
import { getLanguageWordProfile } from '../i18n/languageWordProfiles';
import { getTravelLocationById } from '../worlds/travelLocations';
import { getDifficultyBandForLevel, isValidFullPackLevelNumber } from './difficultyProgression';
import { ExpansionLevel } from './expansionLevelTypes';
import { canBuildWordFromWheelUnits, generateWheelUnitsWithCoverage } from './unitWheelLetterGenerator';
import { generateUnitCrossword } from './unitCrosswordGenerator';
import { toUnitWords, unitWordsToStrings } from './wordUnitAdapter';

export type ExpansionLevelFactoryInput = {
  id: number;
  packLevelNumber: number;
  language: LanguageCode;
  words: string[];
  bonusWords?: string[];
  locationId: string;
  fillerLetters?: string[];
  seed: string;
  rewardCoins?: number;
};

export type ExpansionLevelFactoryResult = {
  level: ExpansionLevel | null;
  rejectedWords: string[];
  issues: string[];
};

function calculateRewardCoins(packLevelNumber: number, mainWordCount: number): number {
  const base = 10;
  const progressionBonus = Math.floor(packLevelNumber / 25);
  const wordBonus = Math.max(0, mainWordCount - 2) * 2;
  return base + progressionBonus + wordBonus;
}

export function createExpansionLevel(input: ExpansionLevelFactoryInput): ExpansionLevelFactoryResult {
  const issues: string[] = [];

  if (!isValidFullPackLevelNumber(input.packLevelNumber)) {
    return {
      level: null,
      rejectedWords: [],
      issues: [`packLevelNumber must be between 1 and 300. Received: ${input.packLevelNumber}.`],
    };
  }

  const difficulty = getDifficultyBandForLevel(input.packLevelNumber);
  const wordProfile = getLanguageWordProfile(input.language);
  const normalizedWords = unitWordsToStrings(toUnitWords(input.words, input.language));
  const normalizedBonusWords = unitWordsToStrings(toUnitWords(input.bonusWords ?? [], input.language));
  const fillerUnits = input.fillerLetters ?? wordProfile.fillerUnits;

  if (normalizedWords.length < difficulty.minMainWords) {
    issues.push(`Not enough source words for ${difficulty.band}: ${normalizedWords.length}/${difficulty.minMainWords}.`);
  }

  const crossword = generateUnitCrossword(normalizedWords, input.language);

  if (crossword.placedWords.length === 0) {
    return {
      level: null,
      rejectedWords: crossword.rejectedWords,
      issues: [...issues, 'No words could be placed into the crossword.'],
    };
  }

  if (crossword.placedWords.length < difficulty.minMainWords) {
    issues.push(`Not enough placed main words for ${difficulty.band}: ${crossword.placedWords.length}/${difficulty.minMainWords}.`);
  }

  if (crossword.intersections < difficulty.minIntersections) {
    issues.push(`Not enough intersections for ${difficulty.band}: ${crossword.intersections}/${difficulty.minIntersections}.`);
  }

  const mainWords = crossword.runtimePlacedWords.map((word, index) => ({ ...word, order: index + 1 }));
  const primaryWord = mainWords[0].word;
  const allPlayableWords = [...mainWords.map((word) => word.word), ...normalizedBonusWords];
  const wheel = generateWheelUnitsWithCoverage({
    language: input.language,
    primaryWord,
    words: allPlayableWords,
    minWheelUnits: difficulty.minWheelLetters,
    maxWheelUnits: difficulty.maxWheelLetters,
    fillerUnits,
    seed: input.seed,
  });

  if (!wheel.canCoverAllWords || wheel.units.length === 0) {
    return {
      level: null,
      rejectedWords: [...crossword.rejectedWords, ...allPlayableWords],
      issues: [
        ...issues,
        `Wheel cannot cover all words within ${difficulty.minWheelLetters}-${difficulty.maxWheelLetters} units. Required units: ${wheel.requiredUnits.join(', ')}.`,
      ],
    };
  }

  const letters = wheel.units;

  for (const word of allPlayableWords) {
    if (!canBuildWordFromWheelUnits(word, letters, input.language)) {
      return {
        level: null,
        rejectedWords: [...crossword.rejectedWords, word],
        issues: [...issues, `Word cannot be built from generated wheel: ${word}.`],
      };
    }
  }

  const location = getTravelLocationById(input.locationId);

  return {
    level: {
      id: input.id,
      packLevelNumber: input.packLevelNumber,
      language: input.language,
      letters,
      mainWords,
      bonusWords: normalizedBonusWords,
      difficultyBand: difficulty.band,
      location: {
        countryCode: location.countryCode,
        countryName: location.countryName,
        locationName: location.locationName,
        chapterName: location.chapterName,
        backgroundPrompt: location.backgroundPrompt,
        backgroundStyle: location.kind === 'landmark' ? 'cartoon-landmark' : location.kind === 'city' ? 'cartoon-city' : location.kind === 'nature' ? 'cartoon-nature' : 'cartoon-cultural-place',
      },
      rewardCoins: input.rewardCoins ?? calculateRewardCoins(input.packLevelNumber, mainWords.length),
      minRequiredIntersections: difficulty.minIntersections,
    },
    rejectedWords: crossword.rejectedWords,
    issues,
  };
}
