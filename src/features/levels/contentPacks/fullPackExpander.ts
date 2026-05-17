import { travelLocations } from '../../worlds/travelLocations';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { LanguageContentPack, LevelSourceEntry } from '../contentPackTypes';

function rotateWords(words: string[], shift: number): string[] {
  if (words.length === 0) return [];
  const normalizedShift = shift % words.length;
  return [...words.slice(normalizedShift), ...words.slice(0, normalizedShift)];
}

function getLocationId(index: number): string {
  return travelLocations[index % travelLocations.length].id;
}

function expandEntry(base: LevelSourceEntry, language: string, levelNumber: number, index: number): LevelSourceEntry {
  return {
    packLevelNumber: levelNumber,
    words: rotateWords(base.words, index),
    bonusWords: base.bonusWords ? rotateWords(base.bonusWords, index) : undefined,
    locationId: getLocationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
  };
}

export function expandContentPackToFullTarget(pack: LanguageContentPack): LanguageContentPack {
  if (pack.entries.length === 0) return pack;

  const targetLevelCount = pack.targetLevelCount || FULL_PACK_LEVEL_COUNT;
  const entries: LevelSourceEntry[] = [];

  for (let levelNumber = 1; levelNumber <= targetLevelCount; levelNumber += 1) {
    const base = pack.entries[(levelNumber - 1) % pack.entries.length];
    entries.push(expandEntry(base, pack.language, levelNumber, levelNumber - 1));
  }

  return {
    ...pack,
    targetLevelCount,
    entries,
  };
}
