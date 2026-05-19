import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { realNounPools } from './realNounPools';
import { Level, PlacedWord } from './types';

type GeneratedLanguage = Exclude<LanguageCode, 'ru'>;

const rotate = <T,>(items: T[], shift: number): T[] => {
  const index = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
};

function difficulty(id: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(id);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function normalizePool(language: LanguageCode): string[] {
  return Array.from(new Set(realNounPools[language].map((word) => word.trim()).filter(Boolean)));
}

function units(word: string, language: LanguageCode): string[] {
  return splitWordIntoUnits(word, language);
}

function canBuild(word: string, letters: string[], language: LanguageCode): boolean {
  const pool = [...letters];
  for (const unit of units(word, language)) {
    const index = pool.indexOf(unit);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function requiredLetters(words: string[], language: LanguageCode): string[] {
  const required = new Map<string, number>();
  for (const word of words) {
    const counts = new Map<string, number>();
    for (const unit of units(word, language)) counts.set(unit, (counts.get(unit) ?? 0) + 1);
    for (const [unit, count] of counts) required.set(unit, Math.max(required.get(unit) ?? 0, count));
  }
  return Array.from(required.entries()).flatMap(([unit, count]) => Array.from({ length: count }, () => unit));
}

function candidateWords(language: LanguageCode, id: number): string[] {
  const pool = normalizePool(language);
  const targetWords = getTargetMainWordCountForLevel(id);
  const jump = Math.max(7, targetWords * 5);
  return rotate(pool, (id - 1) * jump);
}

function buildLetters(language: LanguageCode, words: string[], id: number): string[] {
  const target = getWheelUnitCountForLevel(id);
  const letters = requiredLetters(words, language).slice(0, target);
  for (const unit of requiredLetters(candidateWords(language, id + 29), language)) {
    if (letters.length >= target) break;
    letters.push(unit);
  }
  return letters.slice(0, target);
}

function selectMainNouns(language: LanguageCode, id: number): { letters: string[]; words: string[] } {
  const targetWords = getTargetMainWordCountForLevel(id);
  const wheelSize = getWheelUnitCountForLevel(id);
  const candidates = candidateWords(language, id);

  for (let offset = 0; offset < candidates.length; offset += 1) {
    const words: string[] = [];
    for (const word of rotate(candidates, offset)) {
      if (words.includes(word)) continue;
      const next = [...words, word];
      if (requiredLetters(next, language).length <= wheelSize) words.push(word);
      if (words.length >= targetWords) return { letters: buildLetters(language, words, id), words };
    }
  }

  const shortWords = candidates.filter((word) => units(word, language).length <= wheelSize);
  const words = shortWords.slice(0, Math.min(targetWords, shortWords.length));
  return { letters: buildLetters(language, words, id), words };
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
  const used = new Set(mains);
  return candidateWords(language, id + 41)
    .filter((word) => !used.has(word))
    .filter((word) => canBuild(word, letters, language))
    .slice(0, 8);
}

function level(language: GeneratedLanguage, id: number): Level {
  const selected = selectMainNouns(language, id);
  const uniqueMain = selected.words.filter((word, index, list) => list.indexOf(word) === index && canBuild(word, selected.letters, language));
  const mains = placedWords(uniqueMain);

  return {
    id,
    language,
    letters: selected.letters,
    mainWords: mains,
    bonusWords: bonusNouns(language, selected.letters, uniqueMain, id),
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
