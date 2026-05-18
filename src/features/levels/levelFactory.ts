import { Level, PlacedWord } from './types';
import { generateUnitCrossword } from './unitCrosswordGenerator';
import { WordSeed } from './wordBanks';

function estimateDifficulty(seed: WordSeed): Level['difficulty'] {
  const longestWord = Math.max(...seed.mainWords.map((word) => Array.from(word).length));
  if (longestWord <= 4) return 'easy';
  if (longestWord <= 6) return 'normal';
  return 'hard';
}

function rewardForSeed(seed: WordSeed): number {
  const base = 10;
  const mainWordValue = seed.mainWords.length * 3;
  const letterValue = seed.letters.length * 2;
  const bonusValue = seed.bonusWords.length;
  return base + mainWordValue + letterValue + bonusValue;
}

function placeWords(seed: WordSeed): PlacedWord[] {
  const crossword = generateUnitCrossword(seed.mainWords, seed.language);
  return crossword.runtimePlacedWords;
}

export function createLevelFromSeed(seed: WordSeed, id: number): Level {
  return {
    id,
    language: seed.language,
    letters: seed.letters,
    mainWords: placeWords(seed),
    bonusWords: seed.bonusWords,
    difficulty: estimateDifficulty(seed),
    themeId: seed.themeId,
    rewardCoins: rewardForSeed(seed),
  };
}

export function createLevelsFromSeeds(seeds: WordSeed[]): Level[] {
  const counters = new Map<string, number>();

  return seeds.map((seed) => {
    const nextId = (counters.get(seed.language) ?? 0) + 1;
    counters.set(seed.language, nextId);
    return createLevelFromSeed(seed, nextId);
  });
}
