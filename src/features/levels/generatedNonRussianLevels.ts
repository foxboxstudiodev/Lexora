import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { Level, PlacedWord } from './types';

const UNIT_POOLS: Record<Exclude<LanguageCode, 'ru'>, string[]> = {
  en: ['A', 'R', 'T', 'S', 'E', 'L', 'N', 'O', 'I', 'D', 'M', 'P', 'C', 'H', 'G', 'B'],
  es: ['A', 'R', 'T', 'E', 'S', 'O', 'L', 'N', 'I', 'D', 'M', 'P', 'C', 'U', 'V', 'B'],
  tr: ['A', 'R', 'T', 'E', 'L', 'İ', 'N', 'O', 'U', 'M', 'S', 'Y', 'K', 'D', 'B', 'G'],
  de: ['A', 'R', 'T', 'E', 'N', 'S', 'L', 'I', 'O', 'D', 'M', 'G', 'H', 'B', 'U', 'K'],
  pt: ['A', 'R', 'T', 'E', 'S', 'O', 'L', 'N', 'I', 'D', 'M', 'P', 'C', 'U', 'V', 'B'],
  it: ['A', 'R', 'T', 'E', 'I', 'O', 'S', 'L', 'N', 'D', 'M', 'P', 'C', 'U', 'V', 'B'],
  fr: ['A', 'R', 'T', 'E', 'S', 'O', 'L', 'N', 'I', 'D', 'M', 'P', 'C', 'U', 'V', 'B'],
  az: ['A', 'R', 'T', 'Ə', 'İ', 'L', 'N', 'O', 'U', 'M', 'S', 'Y', 'K', 'D', 'B', 'Q'],
  hi: ['क', 'म', 'न', 'र', 'ल', 'स', 'त', 'प', 'द', 'ग', 'ब', 'ह', 'य', 'व', 'ज', 'च'],
  zh: ['山', '水', '人', '火', '木', '天', '月', '日', '风', '云', '海', '花', '城', '门', '星', '光'],
  ja: ['あ', 'か', 'さ', 'た', 'な', 'ま', 'ら', 'や', 'は', 'わ', 'み', 'り', 'こ', 'そ', 'に', 'ひ'],
  ko: ['가', '나', '다', '라', '마', '사', '하', '바', '소', '리', '미', '도', '구', '서', '우', '진'],
};

function rotate<T>(items: T[], shift: number): T[] {
  if (items.length === 0) return [];
  const normalized = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function mapDifficulty(levelNumber: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(levelNumber);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function buildWheelUnits(language: Exclude<LanguageCode, 'ru'>, levelNumber: number): string[] {
  const wheelCount = getWheelUnitCountForLevel(levelNumber);
  const pool = UNIT_POOLS[language];
  const shift = (levelNumber - 1) * 3 + Math.floor((levelNumber - 1) / 20);
  return rotate(pool, shift).slice(0, wheelCount);
}

function buildWordUnits(units: string[], firstUnit: string, wordIndex: number, levelNumber: number): string[] {
  const maxLength = Math.min(units.length, 6);
  const length = 2 + ((wordIndex + levelNumber) % Math.max(1, maxLength - 1));
  const wordUnits = [firstUnit];

  for (let offset = 1; wordUnits.length < length && offset <= units.length * 2; offset += 1) {
    const candidate = units[(wordIndex * 2 + levelNumber + offset) % units.length];
    if (!wordUnits.includes(candidate)) wordUnits.push(candidate);
  }

  return wordUnits.length >= 2 ? wordUnits : [firstUnit, units.find((unit) => unit !== firstUnit) ?? firstUnit];
}

function buildPlacedWords(units: string[], levelNumber: number): PlacedWord[] {
  const targetWords = getTargetMainWordCountForLevel(levelNumber);
  const placedWords: PlacedWord[] = [];
  const usedWords = new Set<string>();
  let row = 0;
  let col = 0;
  let firstUnit = units[(levelNumber - 1) % units.length];

  for (let index = 0; index < targetWords; index += 1) {
    let wordUnits = buildWordUnits(units, firstUnit, index, levelNumber);
    let word = wordUnits.join('');
    let guard = 0;

    while (usedWords.has(word) && guard < units.length * 3) {
      wordUnits = buildWordUnits(rotate(units, guard + 1), firstUnit, index + guard + 1, levelNumber);
      word = wordUnits.join('');
      guard += 1;
    }

    usedWords.add(word);
    const direction: PlacedWord['direction'] = index % 2 === 0 ? 'across' : 'down';
    placedWords.push({ word, row, col, direction });

    if (direction === 'across') col += wordUnits.length - 1;
    else row += wordUnits.length - 1;

    firstUnit = wordUnits[wordUnits.length - 1];
  }

  return placedWords;
}

function buildBonusWords(units: string[], mainWords: PlacedWord[], levelNumber: number): string[] {
  const main = new Set(mainWords.map((item) => item.word));
  const bonus: string[] = [];

  for (let index = 0; bonus.length < 8 && index < units.length * 4; index += 1) {
    const word = [units[(index + levelNumber) % units.length], units[(index + levelNumber + 2) % units.length]].join('');
    if (!main.has(word) && !bonus.includes(word)) bonus.push(word);
  }

  return bonus;
}

function buildGeneratedLevel(language: Exclude<LanguageCode, 'ru'>, levelNumber: number): Level {
  const units = buildWheelUnits(language, levelNumber);
  const mainWords = buildPlacedWords(units, levelNumber);

  return {
    id: levelNumber,
    language,
    letters: units,
    mainWords,
    bonusWords: buildBonusWords(units, mainWords, levelNumber),
    difficulty: mapDifficulty(levelNumber),
    themeId: 'dawn-garden',
    locationId: travelLocations[(levelNumber - 1) % travelLocations.length].id,
    rewardCoins: 10 + Math.floor(levelNumber / 25) + Math.max(0, mainWords.length - 2) * 2,
  };
}

export function buildGeneratedNonRussianLevels(): Level[] {
  const languages = ACTIVE_LANGUAGES.filter((language): language is Exclude<LanguageCode, 'ru'> => language !== 'ru');
  return languages.flatMap((language) => Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => buildGeneratedLevel(language, index + 1)));
}
