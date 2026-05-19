import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { realNounPools } from './realNounPools';
import { Level, PlacedWord } from './types';

function rotate<T>(items: T[], shift: number): T[] {
  if (items.length === 0) return [];
  const index = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function unique(words: string[]): string[] {
  return Array.from(new Set(words.map((word) => word.trim()).filter(Boolean)));
}

function difficulty(id: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(id);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function canBuild(word: string, letters: string[], language: LanguageCode): boolean {
  const pool = [...letters];
  for (const unit of splitWordIntoUnits(word, language)) {
    const index = pool.indexOf(unit);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function wordLetters(word: string, language: LanguageCode): string[] {
  return splitWordIntoUnits(word, language);
}

function buildWheelFromSeed(seed: string, language: LanguageCode, id: number): string[] {
  const size = getWheelUnitCountForLevel(id);
  const letters = wordLetters(seed, language).slice(0, size);
  const filler = unique(realNounPools[language]).flatMap((word) => wordLetters(word, language));
  for (const unit of rotate(filler, id * 3)) {
    if (letters.length >= size) break;
    letters.push(unit);
  }
  return letters.slice(0, size);
}

function chooseBestWheel(language: LanguageCode, id: number): { letters: string[]; words: string[] } {
  const target = getTargetMainWordCountForLevel(id);
  const nouns = rotate(unique(realNounPools[language]), (id - 1) * 11);
  let best = { letters: [] as string[], words: [] as string[] };

  for (const seed of nouns.slice(0, Math.min(nouns.length, 80))) {
    const letters = buildWheelFromSeed(seed, language, id);
    const words = nouns.filter((word) => canBuild(word, letters, language)).slice(0, target);
    if (words.length > best.words.length) best = { letters, words };
    if (words.length >= target) return { letters, words };
  }

  return best;
}

function place(words: string[]): PlacedWord[] {
  let row = 0;
  let col = 0;
  return words.map((word, index) => {
    const direction: PlacedWord['direction'] = index % 2 === 0 ? 'across' : 'down';
    const placed = { word, row, col, direction };
    const step = Math.max(1, Array.from(word).length - 1);
    if (direction === 'across') col += step;
    else row += step;
    return placed;
  });
}

function buildLevel(language: LanguageCode, id: number): Level {
  const selected = chooseBestWheel(language, id);
  const mainWords = place(selected.words);
  const blocked = new Set(selected.words);
  const bonusWords = rotate(unique(realNounPools[language]), id * 17)
    .filter((word) => !blocked.has(word))
    .filter((word) => canBuild(word, selected.letters, language))
    .slice(0, 8);

  return {
    id,
    language,
    letters: selected.letters,
    mainWords,
    bonusWords,
    difficulty: difficulty(id),
    themeId: 'dawn-garden',
    locationId: travelLocations[(id - 1) % travelLocations.length].id,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, mainWords.length - 2) * 2,
  };
}

export function buildRealNounLevels(): Level[] {
  return ACTIVE_LANGUAGES.flatMap((language) =>
    Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => buildLevel(language, index + 1)),
  );
}
