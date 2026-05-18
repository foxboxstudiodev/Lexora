import { LanguageCode } from '../../i18n/languages';
import { splitWordIntoUnits } from '../../i18n/wordUnits';
import { travelLocations } from '../../worlds/travelLocations';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from '../difficultyProgression';
import { LanguageContentPack, LevelSourceEntry } from '../contentPackTypes';

const NON_RUSSIAN_EXTRA_CANDIDATES = 9;
const NON_RUSSIAN_MIN_CANDIDATES = 18;
const NON_RUSSIAN_MAX_CANDIDATES = 28;
const GENERATED_WORD_LIMIT = 90;

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

function wordFromUnits(units: string[]): string {
  return units.join('');
}

function uniqueUnitsFromWords(words: string[], language: LanguageCode): string[] {
  return Array.from(new Set(words.flatMap((word) => splitWordIntoUnits(word, language)).filter(Boolean)));
}

function addGeneratedUnitPermutations(result: string[], units: string[], maxLength: number): void {
  const used = new Array(units.length).fill(false);

  function walk(path: string[]): void {
    if (result.length >= GENERATED_WORD_LIMIT) return;
    if (path.length >= 2) result.push(wordFromUnits(path));
    if (path.length >= maxLength) return;

    for (let index = 0; index < units.length; index += 1) {
      if (used[index]) continue;
      used[index] = true;
      walk([...path, units[index]]);
      used[index] = false;
      if (result.length >= GENERATED_WORD_LIMIT) return;
    }
  }

  walk([]);
}

function buildGeneratedFamilyWords(base: LevelSourceEntry, language: LanguageCode, levelNumber: number): string[] {
  const maxWheelUnits = getWheelUnitCountForLevel(levelNumber);
  const sourceWords = uniqueWords([...base.words, ...(base.bonusWords ?? [])]);
  const sourceUnits = uniqueUnitsFromWords(sourceWords, language).slice(0, maxWheelUnits);
  const generated: string[] = [...sourceWords];

  for (const word of sourceWords) {
    const units = splitWordIntoUnits(word, language);
    for (let size = 2; size <= Math.min(units.length, maxWheelUnits); size += 1) {
      generated.push(wordFromUnits(units.slice(0, size)));
      generated.push(wordFromUnits(units.slice(units.length - size)));
    }
  }

  addGeneratedUnitPermutations(generated, sourceUnits, Math.min(maxWheelUnits, sourceUnits.length));
  return uniqueWords(generated);
}

function getNonRussianSourceWordCount(levelNumber: number, availableWords: number): number {
  const targetWords = getTargetMainWordCountForLevel(levelNumber);
  return Math.min(availableWords, Math.max(NON_RUSSIAN_MIN_CANDIDATES, Math.min(NON_RUSSIAN_MAX_CANDIDATES, targetWords + NON_RUSSIAN_EXTRA_CANDIDATES)));
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

function expandNonRussianEntry(base: LevelSourceEntry, language: LanguageCode, levelNumber: number): LevelSourceEntry {
  const familyWords = buildGeneratedFamilyWords(base, language, levelNumber);
  const rotatedWords = rotateWords(familyWords, levelNumber - 1);
  const sourceWordCount = getNonRussianSourceWordCount(levelNumber, rotatedWords.length);
  const words = rotatedWords.slice(0, sourceWordCount);
  const mainWords = new Set(words);
  const bonusWords = rotatedWords.filter((word) => !mainWords.has(word)).slice(0, 12);

  return {
    packLevelNumber: levelNumber,
    words,
    bonusWords,
    locationId: getLocationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
    sourceKind: 'seed-expanded',
  };
}

function expandEntry(base: LevelSourceEntry, language: LanguageCode, levelNumber: number, index: number): LevelSourceEntry {
  if (language === 'ru') {
    return expandRussianEntry(base, language, levelNumber, index);
  }

  return expandNonRussianEntry(base, language, levelNumber);
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
