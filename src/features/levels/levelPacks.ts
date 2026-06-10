import { ALL_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import {
  buildRuntimeLevelsForRegisteredLanguage,
  buildRuntimeLevelsForRegisteredLanguageAsync,
  buildRuntimeLevelsFromRegisteredContentPacks,
} from './contentPacks/runtimeContentLevels';
import { buildGeneratedNonRussianLevels } from './generatedNonRussianLevels';
import { extraWordSeeds } from './extraWordSeeds';
import { createLevelsFromSeeds } from './levelFactory';
import { Level } from './types';
import { wordSeeds } from './wordBanks';

type ContentBuildResult = ReturnType<typeof buildRuntimeLevelsFromRegisteredContentPacks>;

let cachedStarterLevels: Level[] | null = null;
let cachedIssues: ContentBuildResult['issues'] = [];
let cachedRejectedWords: ContentBuildResult['rejectedWords'] = [];
const cachedLevelsByLanguage = new Map<LanguageCode, Level[]>();

function cloneLevelForMissingId(source: Level, id: number): Level {
  return {
    ...source,
    id,
    rewardCoins: Math.max(1, source.rewardCoins),
  };
}

function groupLevelsByLanguage(levels: Level[]): Map<LanguageCode, Level[]> {
  const grouped = new Map<LanguageCode, Level[]>();

  for (const level of levels) {
    const existing = grouped.get(level.language) ?? [];
    existing.push(level);
    grouped.set(level.language, existing);
  }

  for (const languageLevels of grouped.values()) {
    languageLevels.sort((a, b) => a.id - b.id);
  }

  return grouped;
}

function buildRussianFallbackLevels(): Level[] {
  return createLevelsFromSeeds([...wordSeeds, ...extraWordSeeds])
    .filter((level) => level.language === 'ru')
    .sort((a, b) => a.id - b.id);
}

function completeLanguageLevels(language: LanguageCode, contentLevels: Level[], fallbackLevels: Level[]): Level[] {
  const sourcePool = contentLevels.length > 0 ? contentLevels : fallbackLevels;

  if (sourcePool.length === 0) return [];

  const byId = new Map(contentLevels.map((level) => [level.id, level]));

  return Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => {
    const id = index + 1;
    return byId.get(id) ?? cloneLevelForMissingId(sourcePool[index % sourcePool.length], id);
  });
}

function buildFallbackLevelsForLanguage(language: LanguageCode): Level[] {
  if (language === 'ru') return buildRussianFallbackLevels();
  return buildGeneratedNonRussianLevels()
    .filter((level) => level.language === language)
    .sort((a, b) => a.id - b.id);
}

function buildStarterLevelsForLanguage(language: LanguageCode): Level[] {
  const contentBuild = buildRuntimeLevelsForRegisteredLanguage(language);
  const fallbackLevels = buildFallbackLevelsForLanguage(language);
  const completedLevels = completeLanguageLevels(language, contentBuild.levels, fallbackLevels)
    .sort((a, b) => a.id - b.id);

  cachedIssues.push(...contentBuild.issues);
  cachedRejectedWords.push(...contentBuild.rejectedWords);

  return completedLevels;
}





const AZ_MAX_WHEEL_LETTERS = 10;
const AZ_MAX_WORD_REUSE = 20;
const AZ_RUNTIME_WORD_RE = /^[A-Z\u00c7\u018f\u011e\u0130I\u00d6\u015e\u00dc]+$/u;

type AzerbaijaniRuntimeEntry = {
  packLevelNumber: number;
  words: string[];
  bonusWords?: string[];
  locationId: string;
};

type AzerbaijaniPlayableSet = {
  words: string[];
  letters: string[];
};

function normalizeAzerbaijaniRuntimeWord(word: string): string {
  return word.trim().toUpperCase();
}

function uniqueNormalizedAzerbaijaniWords(words: string[]): string[] {
  return Array.from(
    new Set(
      words
        .map(normalizeAzerbaijaniRuntimeWord)
        .filter((word) => word.length >= 2 && word.length <= AZ_MAX_WHEEL_LETTERS && AZ_RUNTIME_WORD_RE.test(word)),
    ),
  );
}

function minMainWordsForAzerbaijaniLevel(id: number): number {
  if (id <= 20) return 2;
  if (id <= 100) return 3;
  if (id <= 300) return 4;
  return 5;
}

function targetMainWordsForAzerbaijaniLevel(id: number): number {
  if (id <= 20) return 3;
  if (id <= 100) return 5;
  if (id <= 300) return 6;
  if (id <= 700) return 7;
  return 8;
}

function letterCountsFromLetters(letters: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const letter of letters) {
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }

  return counts;
}

function letterCountsFromWord(word: string): Map<string, number> {
  return letterCountsFromLetters([...word]);
}

function lettersFromCounts(counts: Map<string, number>): string[] {
  const letters: string[] = [];

  for (const [letter, count] of counts.entries()) {
    for (let index = 0; index < count; index += 1) {
      letters.push(letter);
    }
  }

  return letters;
}

function canBuildFromLetters(word: string, letters: string[]): boolean {
  const counts = letterCountsFromLetters(letters);

  for (const letter of word) {
    const current = counts.get(letter) ?? 0;
    if (current <= 0) return false;
    counts.set(letter, current - 1);
  }

  return true;
}

function mergeRequiredLetterCounts(letters: string[], word: string): string[] {
  const base = letterCountsFromLetters(letters);
  const required = letterCountsFromWord(word);

  for (const [letter, count] of required.entries()) {
    base.set(letter, Math.max(base.get(letter) ?? 0, count));
  }

  return lettersFromCounts(base);
}

function padAzerbaijaniWheelLetters(letters: string[]): string[] {
  const next = [...letters];

  for (const filler of ['A', '?', '?', 'R', 'L', 'N', 'S', 'T', 'O', 'U']) {
    if (next.length >= 4) break;
    next.push(filler);
  }

  return next.slice(0, AZ_MAX_WHEEL_LETTERS);
}

function rotateItems<T>(items: T[], shift: number): T[] {
  if (items.length === 0) return [];
  const index = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function playableSignature(words: string[], letters: string[]): string {
  return `${letters.join('')}::${[...words].sort().join('|')}`;
}

function collectGlobalAzerbaijaniWords(entries: AzerbaijaniRuntimeEntry[]): string[] {
  return uniqueNormalizedAzerbaijaniWords(
    entries.flatMap((entry) => [...entry.words, ...(entry.bonusWords ?? [])]),
  ).sort((left, right) => right.length - left.length || left.localeCompare(right));
}

function buildPlayableAzerbaijaniWordSet(
  entry: AzerbaijaniRuntimeEntry,
  globalWords: string[],
  wordUsage: Map<string, number>,
  usedSignatures: Set<string>,
): AzerbaijaniPlayableSet {
  const id = entry.packLevelNumber;
  const minWords = minMainWordsForAzerbaijaniLevel(id);
  const targetWords = targetMainWordsForAzerbaijaniLevel(id);

  const localWords = uniqueNormalizedAzerbaijaniWords([...entry.words, ...(entry.bonusWords ?? [])]);
  const rotatedGlobal = rotateItems(globalWords, id * 37);

  const candidateWords = Array.from(
    new Set([
      ...localWords,
      ...rotatedGlobal,
    ]),
  ).filter((word) => (wordUsage.get(word) ?? 0) < AZ_MAX_WORD_REUSE);

  const anchors = candidateWords
    .slice()
    .sort((left, right) => {
      const leftLocal = localWords.includes(left) ? 1 : 0;
      const rightLocal = localWords.includes(right) ? 1 : 0;
      return rightLocal - leftLocal || right.length - left.length || left.localeCompare(right);
    })
    .slice(0, 500);

  let best: AzerbaijaniPlayableSet | null = null;
  let bestScore = -1;

  for (const anchor of anchors) {
    let letters = [...anchor];
    if (letters.length > AZ_MAX_WHEEL_LETTERS) continue;

    const words = [anchor];

    for (const candidate of candidateWords) {
      if (words.includes(candidate)) continue;
      if ((wordUsage.get(candidate) ?? 0) >= AZ_MAX_WORD_REUSE) continue;

      const nextLetters = mergeRequiredLetterCounts(letters, candidate);
      if (nextLetters.length > AZ_MAX_WHEEL_LETTERS) continue;
      if (!canBuildFromLetters(candidate, nextLetters)) continue;

      letters = nextLetters;
      words.push(candidate);

      if (words.length >= targetWords) break;
    }

    const paddedLetters = padAzerbaijaniWheelLetters(letters);
    const signature = playableSignature(words, paddedLetters);
    const localCount = words.filter((word) => localWords.includes(word)).length;
    const score = words.length * 1000 + localCount * 100 + words.join('').length + paddedLetters.length;

    if (words.length >= minWords && !usedSignatures.has(signature) && score > bestScore) {
      best = { words, letters: paddedLetters };
      bestScore = score;
    }
  }

  if (best) return best;

  for (const anchor of rotateItems(globalWords, id * 91)) {
    let letters = [...anchor];
    if (letters.length > AZ_MAX_WHEEL_LETTERS) continue;

    const words = [anchor];

    for (const candidate of rotateItems(globalWords, id * 53)) {
      if (words.includes(candidate)) continue;

      const nextLetters = mergeRequiredLetterCounts(letters, candidate);
      if (nextLetters.length > AZ_MAX_WHEEL_LETTERS) continue;

      letters = nextLetters;
      words.push(candidate);

      if (words.length >= minWords) break;
    }

    const paddedLetters = padAzerbaijaniWheelLetters(letters);
    const signature = playableSignature(words, paddedLetters);

    if (words.length >= minWords && !usedSignatures.has(signature)) {
      return { words, letters: paddedLetters };
    }
  }

  return {
    words: ['ANA', 'NAR', 'ARAN', 'NAN?', 'ARA'].slice(0, minWords),
    letters: ['A', 'N', 'A', 'R', '?'],
  };
}

type RuntimePlacedWordCandidate = {
  word: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
};

function placedCells(word: RuntimePlacedWordCandidate): Array<{ row: number; col: number; letter: string }> {
  return [...word.word].map((letter, index) => ({
    row: word.direction === 'down' ? word.row + index : word.row,
    col: word.direction === 'across' ? word.col + index : word.col,
    letter,
  }));
}

function hasGridConflict(candidate: RuntimePlacedWordCandidate, placed: RuntimePlacedWordCandidate[]): boolean {
  const occupied = new Map<string, string>();

  for (const word of placed) {
    for (const cell of placedCells(word)) {
      occupied.set(`${cell.row}:${cell.col}`, cell.letter);
    }
  }

  for (const cell of placedCells(candidate)) {
    const existing = occupied.get(`${cell.row}:${cell.col}`);
    if (existing && existing !== cell.letter) return true;
  }

  return false;
}

function intersectionCount(candidate: RuntimePlacedWordCandidate, placed: RuntimePlacedWordCandidate[]): number {
  const occupied = new Map<string, string>();

  for (const word of placed) {
    for (const cell of placedCells(word)) {
      occupied.set(`${cell.row}:${cell.col}`, cell.letter);
    }
  }

  return placedCells(candidate).filter((cell) => occupied.get(`${cell.row}:${cell.col}`) === cell.letter).length;
}

function normalizePlacedWords(words: RuntimePlacedWordCandidate[]): RuntimePlacedWordCandidate[] {
  const cells = words.flatMap(placedCells);
  const minRow = Math.min(...cells.map((cell) => cell.row));
  const minCol = Math.min(...cells.map((cell) => cell.col));

  return words.map((word) => ({
    ...word,
    row: word.row - minRow,
    col: word.col - minCol,
  }));
}

function buildSimpleCrosswordLayout(words: string[]): RuntimePlacedWordCandidate[] {
  const placed: RuntimePlacedWordCandidate[] = [];

  for (const word of words) {
    if (placed.length === 0) {
      placed.push({ word, row: 0, col: 0, direction: 'across' });
      continue;
    }

    let best: RuntimePlacedWordCandidate | null = null;
    let bestIntersections = -1;

    for (const existing of placed) {
      const existingLetters = [...existing.word];

      for (let existingIndex = 0; existingIndex < existingLetters.length; existingIndex += 1) {
        const existingLetter = existingLetters[existingIndex];

        for (let candidateIndex = 0; candidateIndex < word.length; candidateIndex += 1) {
          if (word[candidateIndex] !== existingLetter) continue;

          const direction: RuntimePlacedWordCandidate['direction'] = existing.direction === 'across' ? 'down' : 'across';
          const row =
            direction === 'down'
              ? existing.row + (existing.direction === 'down' ? existingIndex : 0) - candidateIndex
              : existing.row + (existing.direction === 'down' ? existingIndex : 0);
          const col =
            direction === 'across'
              ? existing.col + (existing.direction === 'across' ? existingIndex : 0) - candidateIndex
              : existing.col + (existing.direction === 'across' ? existingIndex : 0);

          const candidate = { word, row, col, direction };
          if (hasGridConflict(candidate, placed)) continue;

          const intersections = intersectionCount(candidate, placed);
          if (intersections > bestIntersections) {
            best = candidate;
            bestIntersections = intersections;
          }
        }
      }
    }

    if (best) {
      placed.push(best);
    } else {
      const maxRow = Math.max(...placed.flatMap((item) => placedCells(item).map((cell) => cell.row)));
      placed.push({ word, row: maxRow + 2, col: 0, direction: 'across' });
    }
  }

  return normalizePlacedWords(placed);
}

function directAzerbaijaniLevel(
  entry: AzerbaijaniRuntimeEntry,
  globalWords: string[],
  wordUsage: Map<string, number>,
  usedSignatures: Set<string>,
): Level {
  const id = entry.packLevelNumber;
  const playable = buildPlayableAzerbaijaniWordSet(entry, globalWords, wordUsage, usedSignatures);
  const placedWords = buildSimpleCrosswordLayout(playable.words);
  const signature = playableSignature(playable.words, playable.letters);

  usedSignatures.add(signature);
  for (const word of playable.words) {
    wordUsage.set(word, (wordUsage.get(word) ?? 0) + 1);
  }

  const bonusWords = Array.from(
    new Set(
      (entry.bonusWords ?? [])
        .map(normalizeAzerbaijaniRuntimeWord)
        .filter((word) => word.length >= 2 && canBuildFromLetters(word, playable.letters) && !playable.words.includes(word)),
    ),
  );

  return {
    id,
    language: 'az',
    letters: playable.letters,
    mainWords: placedWords,
    bonusWords,
    difficulty: id <= 80 ? 'easy' : id <= 220 ? 'normal' : 'hard',
    themeId: 'dawn-garden',
    locationId: entry.locationId,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, playable.words.length - 2) * 2,
  };
}

async function buildDirectAzerbaijaniLevels(): Promise<Level[]> {
  const module = await import('./contentPacks/productionAzerbaijaniPack');
  const entries = module.azContentPack.entries
    .slice()
    .sort((a, b) => a.packLevelNumber - b.packLevelNumber);
  const globalWords = collectGlobalAzerbaijaniWords(entries);
  const wordUsage = new Map<string, number>();
  const usedSignatures = new Set<string>();

  return entries.map((entry) => directAzerbaijaniLevel(entry, globalWords, wordUsage, usedSignatures));
}

async function buildStarterLevelsForLanguageAsync(language: LanguageCode): Promise<Level[]> {
  if (language === 'az') {
    return buildDirectAzerbaijaniLevels();
  }

  const contentBuild = await buildRuntimeLevelsForRegisteredLanguageAsync(language);
  const fallbackLevels = buildFallbackLevelsForLanguage(language);
  const completedLevels = completeLanguageLevels(language, contentBuild.levels, fallbackLevels)
    .sort((a, b) => a.id - b.id);

  cachedIssues.push(...contentBuild.issues);
  cachedRejectedWords.push(...contentBuild.rejectedWords);

  return completedLevels;
}

function buildStarterLevels(): Level[] {
  const contentBuild = buildRuntimeLevelsFromRegisteredContentPacks();
  const contentByLanguage = groupLevelsByLanguage(contentBuild.levels);
  const generatedByLanguage = groupLevelsByLanguage(buildGeneratedNonRussianLevels());
  const russianFallbackLevels = buildRussianFallbackLevels();

  const levels = ALL_LANGUAGES.flatMap((language) => {
    const contentLevels = contentByLanguage.get(language) ?? [];
    const fallbackLevels = language === 'ru' ? russianFallbackLevels : (generatedByLanguage.get(language) ?? []);
    return completeLanguageLevels(language, contentLevels, fallbackLevels);
  }).sort((a, b) => a.language.localeCompare(b.language) || a.id - b.id);

  cachedIssues = contentBuild.issues;
  cachedRejectedWords = contentBuild.rejectedWords;

  const expected = ALL_LANGUAGES.length * TARGET_LEVELS_PER_LANGUAGE;
  if (levels.length !== expected) {
    cachedIssues.push(`Runtime level count mismatch: ${levels.length}/${expected}.`);
  }

  return levels;
}

export function getStarterLevels(): Level[] {
  if (!cachedStarterLevels) cachedStarterLevels = buildStarterLevels();
  return cachedStarterLevels;
}

export function getStarterLevelsByLanguage(language: LanguageCode): Level[] {
  const cached = cachedLevelsByLanguage.get(language);
  if (cached) return cached;

  const levels = buildStarterLevelsForLanguage(language);
  cachedLevelsByLanguage.set(language, levels);
  return levels;
}

export async function getStarterLevelsByLanguageAsync(language: LanguageCode): Promise<Level[]> {
  const cached = cachedLevelsByLanguage.get(language);
  if (cached) return cached;

  const levels = await buildStarterLevelsForLanguageAsync(language);
  cachedLevelsByLanguage.set(language, levels);
  return levels;
}

export function getContentPipelineIssues(): ContentBuildResult['issues'] {
  getStarterLevels();
  return cachedIssues;
}

export function getContentPipelineRejectedWords(): ContentBuildResult['rejectedWords'] {
  getStarterLevels();
  return cachedRejectedWords;
}
