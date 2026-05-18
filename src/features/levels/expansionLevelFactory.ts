import { LanguageCode } from '../i18n/languages';
import { getLanguageWordProfile } from '../i18n/languageWordProfiles';
import { getTravelLocationById } from '../worlds/travelLocations';
import { getDifficultyBandForLevel, isValidFullPackLevelNumber } from './difficultyProgression';
import { ExpansionLevel } from './expansionLevelTypes';
import { canBuildWordFromWheelUnits, generateWheelUnitsWithCoverage } from './unitWheelLetterGenerator';
import { generateUnitCrossword } from './unitCrosswordGenerator';
import { filterAllowedMainWords } from './wordQualityRules';
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

function uniqueWords(words: string[]): string[] {
  return Array.from(new Set(words.filter((word) => word.trim().length > 0)));
}

function rotateWords(words: string[], shift: number): string[] {
  if (words.length === 0) return [];
  const normalizedShift = shift % words.length;
  return [...words.slice(normalizedShift), ...words.slice(0, normalizedShift)];
}

function getDisallowedWords(words: string[], language: LanguageCode): string[] {
  const allowed = new Set(filterAllowedMainWords(words, language));
  return uniqueWords(words).filter((word) => !allowed.has(word));
}

function buildCandidateWordSets(words: string[], exactWords: number, seed: string): string[][] {
  const source = uniqueWords(words);
  if (source.length < exactWords) return [];

  return source
    .map((_, shift) => rotateWords(source, shift).slice(0, exactWords))
    .filter((candidate) => candidate.length === exactWords)
    .sort((left, right) => `${seed}:${left.join('|')}`.localeCompare(`${seed}:${right.join('|')}`));
}

function createLevelFromMainWords(input: ExpansionLevelFactoryInput, mainSourceWords: string[], bonusSourceWords: string[], inheritedIssues: string[]): ExpansionLevelFactoryResult {
  const difficulty = getDifficultyBandForLevel(input.packLevelNumber);
  const wordProfile = getLanguageWordProfile(input.language);
  const fillerUnits = input.fillerLetters ?? wordProfile.fillerUnits;
  const crossword = generateUnitCrossword(mainSourceWords, input.language);

  if (crossword.placedWords.length !== difficulty.targetMainWords) {
    return {
      level: null,
      rejectedWords: [...crossword.rejectedWords, ...mainSourceWords],
      issues: [...inheritedIssues, `Crossword placed ${crossword.placedWords.length}/${difficulty.targetMainWords} required main words.`],
    };
  }

  const mainWords = crossword.runtimePlacedWords.map((word, index) => ({ ...word, order: index + 1 }));
  const primaryWord = mainWords[0].word;
  const playableMainWords = mainWords.map((word) => word.word);
  const wheel = generateWheelUnitsWithCoverage({
    language: input.language,
    primaryWord,
    words: playableMainWords,
    minWheelUnits: difficulty.minWheelLetters,
    maxWheelUnits: difficulty.maxWheelLetters,
    fillerUnits,
    seed: input.seed,
  });

  if (!wheel.canCoverAllWords || wheel.units.length !== difficulty.maxWheelLetters) {
    return {
      level: null,
      rejectedWords: [...crossword.rejectedWords, ...mainSourceWords],
      issues: [...inheritedIssues, `Wheel cannot cover candidate main words with exact ${difficulty.maxWheelLetters} units.`],
    };
  }

  for (const word of playableMainWords) {
    if (!canBuildWordFromWheelUnits(word, wheel.units, input.language)) {
      return {
        level: null,
        rejectedWords: [...crossword.rejectedWords, word],
        issues: [...inheritedIssues, `Main word cannot be built from generated wheel: ${word}.`],
      };
    }
  }

  const normalizedBonus = uniqueWords(filterAllowedMainWords(bonusSourceWords, input.language));
  const bonusWords = normalizedBonus.filter((word) => canBuildWordFromWheelUnits(word, wheel.units, input.language));
  const rejectedBonusWords = uniqueWords([...getDisallowedWords(bonusSourceWords, input.language), ...normalizedBonus.filter((word) => !bonusWords.includes(word))]);
  const location = getTravelLocationById(input.locationId);

  return {
    level: {
      id: input.id,
      packLevelNumber: input.packLevelNumber,
      language: input.language,
      letters: wheel.units,
      mainWords,
      bonusWords,
      difficultyBand: difficulty.band,
      location: {
        id: location.id,
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
    rejectedWords: uniqueWords([...crossword.rejectedWords, ...rejectedBonusWords]),
    issues: inheritedIssues,
  };
}

export function createExpansionLevel(input: ExpansionLevelFactoryInput): ExpansionLevelFactoryResult {
  const issues: string[] = [];

  if (!isValidFullPackLevelNumber(input.packLevelNumber)) {
    return { level: null, rejectedWords: [], issues: [`packLevelNumber must be between 1 and 300. Received: ${input.packLevelNumber}.`] };
  }

  const difficulty = getDifficultyBandForLevel(input.packLevelNumber);
  const rawNormalizedWords = unitWordsToStrings(toUnitWords(input.words, input.language));
  const rawNormalizedBonusWords = unitWordsToStrings(toUnitWords(input.bonusWords ?? [], input.language));
  const normalizedWords = filterAllowedMainWords(rawNormalizedWords, input.language);
  const normalizedBonusWords = filterAllowedMainWords(rawNormalizedBonusWords, input.language);
  const filteredWords = uniqueWords([
    ...getDisallowedWords(rawNormalizedWords, input.language),
    ...getDisallowedWords(rawNormalizedBonusWords, input.language),
  ]);

  if (filteredWords.length > 0) {
    issues.push(`Filtered disallowed non-noun or banned words: ${filteredWords.join(', ')}.`);
  }

  if (normalizedWords.length < difficulty.targetMainWords) {
    issues.push(`Not enough source words: ${normalizedWords.length}/${difficulty.targetMainWords}.`);
  }

  const candidateSets = buildCandidateWordSets(normalizedWords, difficulty.targetMainWords, input.seed);
  const rejectedWords: string[] = [...filteredWords];
  const attemptIssues: string[] = [];

  for (const candidate of candidateSets) {
    const result = createLevelFromMainWords(input, candidate, normalizedBonusWords, issues);
    rejectedWords.push(...result.rejectedWords);
    attemptIssues.push(...result.issues);
    if (result.level) return result;
  }

  return {
    level: null,
    rejectedWords: uniqueWords([...rejectedWords, ...normalizedWords]),
    issues: uniqueWords([...issues, ...attemptIssues, 'No candidate set produced a valid exact-count crossword and exact-size wheel.']),
  };
}
