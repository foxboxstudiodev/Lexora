import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { realNounPools } from './realNounPools';
import { Level, PlacedWord } from './types';

type GeneratedLanguage = Exclude<LanguageCode, 'ru'>;

const spin = <T,>(items: T[], n: number): T[] => {
  const i = ((n % items.length) + items.length) % items.length;
  return [...items.slice(i), ...items.slice(0, i)];
};

function difficulty(id: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(id);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function uniqueWords(words: string[]): string[] {
  return Array.from(new Set(words.map((word) => word.trim()).filter(Boolean)));
}

function wordUnits(word: string, language: LanguageCode): string[] {
  return splitWordIntoUnits(word, language);
}

function uniqueUnits(words: string[], language: LanguageCode): string[] {
  return Array.from(new Set(words.flatMap((word) => wordUnits(word, language))));
}

function canBuild(word: string, letters: string[], language: LanguageCode): boolean {
  const pool = [...letters];
  for (const unit of wordUnits(word, language)) {
    const index = pool.indexOf(unit);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function candidateWords(language: LanguageCode, id: number): string[] {
  const words = uniqueWords(realNounPools[language]);
  return spin(words, id - 1);
}

function buildLetters(language: LanguageCode, words: string[], id: number): string[] {
  const target = getWheelUnitCountForLevel(id);
  const letters = uniqueUnits(words, language).slice(0, target);
  const fallback = uniqueUnits(realNounPools[language], language);

  for (const unit of spin(fallback, id)) {
    if (letters.length >= target) break;
    if (!letters.includes(unit)) letters.push(unit);
  }

  return letters.slice(0, target);
}

function selectMainNouns(language: LanguageCode, id: number): { letters: string[]; words: string[] } {
  const targetWords = getTargetMainWordCountForLevel(id);
  const candidates = candidateWords(language, id);

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const seed = spin(candidates, offset).slice(0, Math.max(targetWords, 8));
    const letters = buildLetters(language, seed, id);
    const buildable = candidates.filter((word) => canBuild(word, letters, language));

    if (buildable.length >= targetWords) {
      return { letters, words: buildable.slice(0, targetWords) };
    }
  }

  const letters = buildLetters(language, candidates, id);
  const buildable = candidates.filter((word) => canBuild(word, letters, language));
  const repeated = Array.from({ length: targetWords }, (_, index) => buildable[index % Math.max(1, buildable.length)] ?? candidates[index % candidates.length]);
  return { letters, words: repeated };
}

function placedWords(words: string[]): PlacedWord[] {
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

function bonusNouns(language: LanguageCode, letters: string[], mains: string[], id: number): string[] {
  const blocked = new Set(mains);
  return candidateWords(language, id + 17)
    .filter((word) => !blocked.has(word))
    .filter((word) => canBuild(word, letters, language))
    .slice(0, 8);
}

function level(language: GeneratedLanguage, id: number): Level {
  const selected = selectMainNouns(language, id);
  const mains = placedWords(selected.words);

  return {
    id,
    language,
    letters: selected.letters,
    mainWords: mains,
    bonusWords: bonusNouns(language, selected.letters, selected.words, id),
    difficulty: difficulty(id),
    themeId: 'dawn-garden',
    locationId: travelLocations[(id - 1) % travelLocations.length].id,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, mains.length - 2) * 2,
  };
}

export function buildGeneratedNonRussianLevels(): Level[] {
  return ACTIVE_LANGUAGES
    .filter((language): language is GeneratedLanguage => language !== 'ru')
    .flatMap((language) => Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => level(language, index + 1)));
}
