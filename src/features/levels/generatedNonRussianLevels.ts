import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { getLanguageWordProfile } from '../i18n/languageWordProfiles';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { generateUnitCrossword } from './unitCrosswordGenerator';
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

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function circularWord(units: string[], start: number, length: number, reversed = false): string {
  const wordUnits = Array.from({ length }, (_, index) => units[(start + index) % units.length]);
  return (reversed ? [...wordUnits].reverse() : wordUnits).join('');
}

function buildCandidateWords(units: string[], targetWords: number, seedShift: number): string[] {
  const candidates: string[] = [];
  const maxLength = Math.min(units.length, 6);

  for (let length = maxLength; length >= 2; length -= 1) {
    for (let start = 0; start < units.length; start += 1) {
      candidates.push(circularWord(units, start + seedShift, length));
      candidates.push(circularWord(units, start + seedShift, length, true));
    }
  }

  for (let start = 0; start < units.length; start += 1) {
    const first = units[(start + seedShift) % units.length];
    const third = units[(start + seedShift + 2) % units.length];
    const fifth = units[(start + seedShift + 4) % units.length];
    candidates.push([first, third].join(''));
    candidates.push([first, third, fifth].join(''));
  }

  return unique(candidates).filter((word) => word.length > 0).slice(0, Math.max(targetWords * 6, 36));
}

function mapDifficulty(levelNumber: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(levelNumber);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function buildWheelUnits(language: Exclude<LanguageCode, 'ru'>, levelNumber: number): string[] {
  const wheelCount = getWheelUnitCountForLevel(levelNumber);
  const profile = getLanguageWordProfile(language);
  const pool = unique([...UNIT_POOLS[language], ...profile.fillerUnits]);
  const shift = (levelNumber - 1) * 3 + Math.floor((levelNumber - 1) / 20);
  return rotate(pool, shift).slice(0, wheelCount);
}

function buildPlacedWords(language: Exclude<LanguageCode, 'ru'>, units: string[], levelNumber: number): PlacedWord[] {
  const targetWords = getTargetMainWordCountForLevel(levelNumber);
  const seedShift = (levelNumber - 1) % units.length;
  const candidates = buildCandidateWords(units, targetWords, seedShift);

  for (let attempt = 0; attempt < candidates.length; attempt += 1) {
    const selected = rotate(candidates, attempt).slice(0, targetWords);
    const crossword = generateUnitCrossword(selected, language);
    if (crossword.runtimePlacedWords.length === targetWords) {
      return crossword.runtimePlacedWords;
    }
  }

  throw new Error(`${language} level ${levelNumber} could not generate ${targetWords} connected runtime words.`);
}

function buildBonusWords(language: Exclude<LanguageCode, 'ru'>, units: string[], mainWords: PlacedWord[], levelNumber: number): string[] {
  const main = new Set(mainWords.map((item) => item.word));
  return buildCandidateWords(units, mainWords.length + 6, levelNumber)
    .filter((word) => !main.has(word))
    .slice(0, 8);
}

function buildGeneratedLevel(language: Exclude<LanguageCode, 'ru'>, levelNumber: number): Level {
  const units = buildWheelUnits(language, levelNumber);
  const mainWords = buildPlacedWords(language, units, levelNumber);
  const locationId = travelLocations[(levelNumber - 1) % travelLocations.length].id;

  return {
    id: levelNumber,
    language,
    letters: units,
    mainWords,
    bonusWords: buildBonusWords(language, units, mainWords, levelNumber),
    difficulty: mapDifficulty(levelNumber),
    themeId: 'dawn-garden',
    locationId,
    rewardCoins: 10 + Math.floor(levelNumber / 25) + Math.max(0, mainWords.length - 2) * 2,
  };
}

export function buildGeneratedNonRussianLevels(): Level[] {
  const languages = ACTIVE_LANGUAGES.filter((language): language is Exclude<LanguageCode, 'ru'> => language !== 'ru');

  return languages.flatMap((language) =>
    Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => buildGeneratedLevel(language, index + 1)),
  );
}
