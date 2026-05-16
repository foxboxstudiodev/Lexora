import { normalizeLevelWord } from '../game/engine';
import { splitWordIntoUnits } from '../i18n/wordUnits';
import { getKnownWorldIds } from '../worlds/worlds';
import { Level } from './types';
import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';

export type LevelValidationSeverity = 'error' | 'warning';

export type LevelValidationError = {
  levelId: number;
  code: string;
  message: string;
  severity: LevelValidationSeverity;
};

type OccupiedCell = {
  letter: string;
  words: Set<string>;
};

function issue(levelId: number, code: string, message: string, severity: LevelValidationSeverity): LevelValidationError {
  return { levelId, code, message, severity };
}

function canBuildFromLetters(word: string, letters: string[], level: Level): boolean {
  const pool = [...letters];
  for (const unit of splitWordIntoUnits(word, level.language)) {
    const index = pool.indexOf(unit);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function wheelOrderWord(letters: string[]): string {
  return letters.join('');
}

function reverseWheelOrderWord(letters: string[]): string {
  return [...letters].reverse().join('');
}

function validateWheelQuality(level: Level): LevelValidationError[] {
  const issues: LevelValidationError[] = [];
  const mainWords = level.mainWords.map((item) => normalizeLevelWord(item.word, level));
  const primaryWord = mainWords[0];
  const ordered = normalizeLevelWord(wheelOrderWord(level.letters), level);
  const reversed = normalizeLevelWord(reverseWheelOrderWord(level.letters), level);

  if (level.letters.length < MIN_WHEEL_UNITS) {
    issues.push(issue(
      level.id,
      'wheel.units.too_few',
      `Wheel must contain at least ${MIN_WHEEL_UNITS} selectable units.`,
      'error',
    ));
  }

  if (level.letters.length > MAX_WHEEL_UNITS) {
    issues.push(issue(
      level.id,
      'wheel.units.too_many',
      `Wheel must contain no more than ${MAX_WHEEL_UNITS} selectable units.`,
      'error',
    ));
  }

  if (primaryWord && (primaryWord === ordered || primaryWord === reversed)) {
    issues.push(issue(
      level.id,
      'expansion.wheel.primary_ordered_word',
      `${primaryWord} equals the displayed wheel order or reverse order. Expanded packs must keep this extremely rare.`,
      'warning',
    ));
  }

  return issues;
}

function validateGrid(level: Level): LevelValidationError[] {
  const issues: LevelValidationError[] = [];
  const occupied = new Map<string, OccupiedCell>();

  for (const placed of level.mainWords) {
    if (placed.row < 0 || placed.col < 0) {
      issues.push(issue(level.id, 'grid.negative_position', `${placed.word} has a negative grid position.`, 'error'));
      continue;
    }

    const normalizedWord = normalizeLevelWord(placed.word, level);
    const letters = splitWordIntoUnits(normalizedWord, level.language);
    letters.forEach((letter, index) => {
      const row = placed.direction === 'down' ? placed.row + index : placed.row;
      const col = placed.direction === 'across' ? placed.col + index : placed.col;
      const key = `${row}:${col}`;
      const existing = occupied.get(key);

      if (existing && existing.letter !== letter) {
        issues.push(issue(level.id, 'grid.letter_conflict', `${placed.word} conflicts at ${key}: ${existing.letter} vs ${letter}.`, 'error'));
      }

      if (existing) {
        existing.words.add(normalizedWord);
      } else {
        occupied.set(key, { letter, words: new Set([normalizedWord]) });
      }
    });
  }

  if (occupied.size === 0) {
    issues.push(issue(level.id, 'grid.empty', 'A level must have at least one crossword cell.', 'error'));
  }

  const intersections = Array.from(occupied.values()).filter((cell) => cell.words.size > 1).length;
  if (level.mainWords.length > 1 && intersections < 1) {
    issues.push(issue(
      level.id,
      'expansion.grid.no_intersections',
      'Expanded crossword levels should contain at least one shared-letter intersection.',
      'warning',
    ));
  }

  return issues;
}

export function validateLevel(level: Level): LevelValidationError[] {
  const issues: LevelValidationError[] = [];
  const knownWorldIds = getKnownWorldIds();
  const mainWords = level.mainWords.map((item) => normalizeLevelWord(item.word, level));
  const bonusWords = level.bonusWords.map((word) => normalizeLevelWord(word, level));
  const allWords = [...mainWords, ...bonusWords];

  if (!knownWorldIds.has(level.themeId)) {
    issues.push(issue(level.id, 'theme.unknown', `${level.themeId} is not registered in worlds.ts.`, 'error'));
  }

  if (level.mainWords.length < 2) {
    issues.push(issue(level.id, 'main.too_few', 'A level must contain at least 2 main words.', 'error'));
  }

  if (new Set(mainWords).size !== mainWords.length) {
    issues.push(issue(level.id, 'main.duplicates', 'Main words contain duplicates.', 'error'));
  }

  if (new Set(allWords).size !== allWords.length) {
    issues.push(issue(level.id, 'words.duplicates', 'Main and bonus words overlap.', 'error'));
  }

  for (const word of allWords) {
    if (!canBuildFromLetters(word, level.letters, level)) {
      issues.push(issue(level.id, 'word.impossible', `${word} cannot be built from level letters.`, 'error'));
    }
  }

  if (level.rewardCoins < 1) {
    issues.push(issue(level.id, 'reward.invalid', 'Reward must be positive.', 'error'));
  }

  return [...issues, ...validateWheelQuality(level), ...validateGrid(level)];
}

export function getBlockingLevelErrors(level: Level): LevelValidationError[] {
  return validateLevel(level).filter((item) => item.severity === 'error');
}

export function getExpansionLevelWarnings(level: Level): LevelValidationError[] {
  return validateLevel(level).filter((item) => item.severity === 'warning');
}

export function assertValidLevel(level: Level): void {
  const errors = getBlockingLevelErrors(level);
  if (errors.length > 0) {
    throw new Error(errors.map((error) => `${error.code}: ${error.message}`).join('\n'));
  }
}
