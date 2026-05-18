import { travelLocations } from '../../worlds/travelLocations';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel } from '../difficultyProgression';
import { LanguageContentPack, LevelSourceEntry } from '../contentPackTypes';

const NON_RUSSIAN_LEVEL_WORD_POOL_SIZE = 28;

function rotateWords(words: string[], shift: number): string[] {
  if (words.length === 0) return [];
  const normalizedShift = shift % words.length;
  return [...words.slice(normalizedShift), ...words.slice(0, normalizedShift)];
}

function uniqueWords(words: string[]): string[] {
  return Array.from(new Set(words.map((word) => word.trim()).filter(Boolean)));
}

function getLocationId(index: number): string {
  return travelLocations[index % travelLocations.length].id;
}

function buildLanguageWordPool(entries: LevelSourceEntry[]): string[] {
  return uniqueWords(entries.flatMap((entry) => [...entry.words, ...(entry.bonusWords ?? [])]));
}

function pickWordsForLevel(pool: string[], base: LevelSourceEntry, levelNumber: number, language: string): string[] {
  const targetCount = getTargetMainWordCountForLevel(levelNumber);
  const levelPool = uniqueWords([...base.words, ...pool]);
  const rotated = rotateWords(levelPool, levelNumber - 1);

  if (language === 'ru') {
    return rotated.slice(0, Math.min(targetCount, rotated.length));
  }

  return rotated.slice(0, Math.min(Math.max(targetCount * 6, NON_RUSSIAN_LEVEL_WORD_POOL_SIZE), rotated.length));
}

function pickBonusWords(pool: string[], mainWords: string[], levelNumber: number): string[] {
  const main = new Set(mainWords);
  return rotateWords(pool.filter((word) => !main.has(word)), levelNumber).slice(0, 12);
}

function expandEntry(base: LevelSourceEntry, pool: string[], language: string, levelNumber: number): LevelSourceEntry {
  const words = pickWordsForLevel(pool, base, levelNumber, language);
  return {
    packLevelNumber: levelNumber,
    words,
    bonusWords: pickBonusWords(pool, words, levelNumber),
    locationId: getLocationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
    sourceKind: 'seed-expanded',
  };
}

export function expandContentPackToFullTarget(pack: LanguageContentPack): LanguageContentPack {
  if (pack.entries.length === 0) return pack;

  const targetLevelCount = pack.targetLevelCount || FULL_PACK_LEVEL_COUNT;
  const pool = buildLanguageWordPool(pack.entries);
  const entries: LevelSourceEntry[] = [];

  for (let levelNumber = 1; levelNumber <= targetLevelCount; levelNumber += 1) {
    const base = pack.entries[(levelNumber - 1) % pack.entries.length];
    entries.push(expandEntry(base, pool, pack.language, levelNumber));
  }

  return {
    ...pack,
    targetLevelCount,
    entries,
  };
}
