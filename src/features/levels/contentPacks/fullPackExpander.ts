import { LanguageCode } from '../../i18n/languages';
import { splitWordIntoUnits } from '../../i18n/wordUnits';
import { travelLocations } from '../../worlds/travelLocations';
import { FULL_PACK_LEVEL_COUNT, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from '../difficultyProgression';
import { LanguageContentPack, LevelSourceEntry } from '../contentPackTypes';

const EXTRA_CANDIDATES = 8;
const WORD_LIMIT = 100;

function rotate<T>(items: T[], shift: number): T[] {
  if (items.length === 0) return [];
  const index = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function unique(words: string[]): string[] {
  return Array.from(new Set(words.map((word) => word.trim()).filter(Boolean)));
}

function locationId(index: number): string {
  return travelLocations[index % travelLocations.length].id;
}

function unitsFrom(words: string[], language: LanguageCode, limit: number): string[] {
  return unique(words.flatMap((word) => splitWordIntoUnits(word, language))).slice(0, limit);
}

function word(units: string[]): string {
  return units.join('');
}

function generatedWords(base: LevelSourceEntry, language: LanguageCode, levelNumber: number): string[] {
  const source = unique([...base.words, ...(base.bonusWords ?? [])]);
  const units = unitsFrom(source, language, getWheelUnitCountForLevel(levelNumber));
  const out = [...source];

  for (const sourceWord of source) {
    const parts = splitWordIntoUnits(sourceWord, language);
    for (let size = 2; size <= Math.min(parts.length, units.length); size += 1) {
      out.push(word(parts.slice(0, size)));
      out.push(word(parts.slice(parts.length - size)));
    }
  }

  for (let size = units.length; size >= 2 && out.length < WORD_LIMIT; size -= 1) {
    for (let start = 0; start < units.length && out.length < WORD_LIMIT; start += 1) {
      const parts = Array.from({ length: size }, (_, index) => units[(start + index + levelNumber) % units.length]);
      out.push(word(parts));
      out.push(word([...parts].reverse()));
    }
  }

  return unique(out);
}

function expandEntry(base: LevelSourceEntry, language: LanguageCode, levelNumber: number): LevelSourceEntry {
  const targetWords = getTargetMainWordCountForLevel(levelNumber);
  const candidates = rotate(generatedWords(base, language, levelNumber), levelNumber - 1);
  const words = candidates.slice(0, Math.min(candidates.length, targetWords + EXTRA_CANDIDATES));
  const main = new Set(words);

  return {
    packLevelNumber: levelNumber,
    words,
    bonusWords: candidates.filter((item) => !main.has(item)).slice(0, 12),
    locationId: locationId(levelNumber - 1),
    seed: `${language}-full-${levelNumber}`,
    sourceKind: 'seed-expanded',
  };
}

export function expandContentPackToFullTarget(pack: LanguageContentPack): LanguageContentPack {
  if (pack.entries.length === 0) return pack;

  return {
    ...pack,
    targetLevelCount: pack.targetLevelCount || FULL_PACK_LEVEL_COUNT,
    entries: Array.from({ length: pack.targetLevelCount || FULL_PACK_LEVEL_COUNT }, (_, index) => {
      const levelNumber = index + 1;
      const base = pack.entries[index % pack.entries.length];
      return expandEntry(base, pack.language, levelNumber);
    }),
  };
}
