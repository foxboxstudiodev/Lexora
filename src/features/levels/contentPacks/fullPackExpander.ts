import { travelLocations } from '../../worlds/travelLocations';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel } from '../difficultyProgression';
import { LanguageContentPack, LevelSourceEntry } from '../contentPackTypes';

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

function buildPackWordPool(pack: LanguageContentPack): string[] {
  return uniqueWords(pack.entries.flatMap((entry) => [...entry.words, ...(entry.bonusWords ?? [])]));
}

function getNonRussianSourceWordCount(levelNumber: number, availableWords: number): number {
  const targetWords = getTargetMainWordCountForLevel(levelNumber);
  return Math.min(availableWords, Math.max(targetWords + 3, 8));
}

function expandRussianEntry(base: LevelSourceEntry, language: string, levelNumber: number, index: number): LevelSourceEntry {
  return {
    packLevelNumber: levelNumber,
    words: rotateWords(base.words, index),
    bonusWords: base.bonusWords ? rotateWords(base.bonusWords, index) : undefined,
    locationId: getLocationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
    sourceKind: 'seed-expanded',
  };
}

function expandNonRussianEntry(base: LevelSourceEntry, packWordPool: string[], language: string, levelNumber: number): LevelSourceEntry {
  const rotatedPool = rotateWords(uniqueWords([...base.words, ...packWordPool]), levelNumber - 1);
  const sourceWordCount = getNonRussianSourceWordCount(levelNumber, rotatedPool.length);
  const words = rotatedPool.slice(0, sourceWordCount);
  const mainWords = new Set(words);
  const bonusWords = rotatedPool.filter((word) => !mainWords.has(word)).slice(0, 10);

  return {
    packLevelNumber: levelNumber,
    words,
    bonusWords,
    locationId: getLocationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
    sourceKind: 'seed-expanded',
  };
}

function expandEntry(base: LevelSourceEntry, packWordPool: string[], language: string, levelNumber: number, index: number): LevelSourceEntry {
  if (language === 'ru') {
    return expandRussianEntry(base, language, levelNumber, index);
  }

  return expandNonRussianEntry(base, packWordPool, language, levelNumber);
}

export function expandContentPackToFullTarget(pack: LanguageContentPack): LanguageContentPack {
  if (pack.entries.length === 0) return pack;

  const targetLevelCount = pack.targetLevelCount || FULL_PACK_LEVEL_COUNT;
  const entries: LevelSourceEntry[] = [];
  const packWordPool = buildPackWordPool(pack);

  for (let levelNumber = 1; levelNumber <= targetLevelCount; levelNumber += 1) {
    const base = pack.entries[(levelNumber - 1) % pack.entries.length];
    entries.push(expandEntry(base, packWordPool, pack.language, levelNumber, levelNumber - 1));
  }

  return {
    ...pack,
    targetLevelCount,
    entries,
  };
}
