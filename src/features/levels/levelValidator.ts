import { normalizeWord } from '../game/engine';
import { getKnownWorldIds } from '../worlds/worlds';
import { Level } from './types';

export type LevelValidationError = {
  levelId: number;
  code: string;
  message: string;
};

type OccupiedCell = {
  letter: string;
  words: Set<string>;
};

const MIN_WHEEL_LETTERS = 5;

function canBuildFromLetters(word: string, letters: string[]): boolean {
  const pool = letters.map(normalizeWord);
  for (const letter of Array.from(normalizeWord(word))) {
    const index = pool.indexOf(letter);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function wheelOrderWord(letters: string[]): string {
  return normalizeWord(letters.join(''));
}

function reverseWheelOrderWord(letters: string[]): string {
  return normalizeWord([...letters].reverse().join(''));
}

function validateWheelQuality(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const mainWords = level.mainWords.map((item) => normalizeWord(item.word));
  const primaryWord = mainWords[0];
  const ordered = wheelOrderWord(level.letters);
  const reversed = reverseWheelOrderWord(level.letters);

  if (level.letters.length < MIN_WHEEL_LETTERS) {
    errors.push({
      levelId: level.id,
      code: 'letters.minimum_not_met',
      message: `A level must contain at least ${MIN_WHEEL_LETTERS} wheel letters.`,
    });
  }

  if (primaryWord && (primaryWord === ordered || primaryWord === reversed)) {
    errors.push({
      levelId: level.id,
      code: 'wheel.primary_ordered_word',
      message: `${primaryWord} equals the displayed wheel order or reverse order. This must be rare and rejected by default.`,
    });
  }

  return errors;
}

function validateGrid(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const occupied = new Map<string, OccupiedCell>();

  for (const placed of level.mainWords) {
    if (placed.row < 0 || placed.col < 0) {
      errors.push({ levelId: level.id, code: 'grid.negative_position', message: `${placed.word} has a negative grid position.` });
      continue;
    }

    const normalizedWord = normalizeWord(placed.word);
    const letters = Array.from(normalizedWord);
    letters.forEach((letter, index) => {
      const row = placed.direction === 'down' ? placed.row + index : placed.row;
      const col = placed.direction === 'across' ? placed.col + index : placed.col;
      const key = `${row}:${col}`;
      const existing = occupied.get(key);

      if (existing && existing.letter !== letter) {
        errors.push({ levelId: level.id, code: 'grid.letter_conflict', message: `${placed.word} conflicts at ${key}: ${existing.letter} vs ${letter}.` });
      }

      if (existing) {
        existing.words.add(normalizedWord);
      } else {
        occupied.set(key, { letter, words: new Set([normalizedWord]) });
      }
    });
  }

  if (occupied.size === 0) {
    errors.push({ levelId: level.id, code: 'grid.empty', message: 'A level must have at least one crossword cell.' });
  }

  const intersections = Array.from(occupied.values()).filter((cell) => cell.words.size > 1).length;
  if (level.mainWords.length > 1 && intersections < 1) {
    errors.push({
      levelId: level.id,
      code: 'grid.no_intersections',
      message: 'A crossword level with multiple words must contain at least one shared-letter intersection.',
    });
  }

  return errors;
}

export function validateLevel(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const knownWorldIds = getKnownWorldIds();
  const mainWords = level.mainWords.map((item) => normalizeWord(item.word));
  const bonusWords = level.bonusWords.map(normalizeWord);
  const allWords = [...mainWords, ...bonusWords];

  if (!knownWorldIds.has(level.themeId)) {
    errors.push({ levelId: level.id, code: 'theme.unknown', message: `${level.themeId} is not registered in worlds.ts.` });
  }

  if (level.mainWords.length < 2) {
    errors.push({ levelId: level.id, code: 'main.too_few', message: 'A level must contain at least 2 main words.' });
  }

  if (new Set(mainWords).size !== mainWords.length) {
    errors.push({ levelId: level.id, code: 'main.duplicates', message: 'Main words contain duplicates.' });
  }

  if (new Set(allWords).size !== allWords.length) {
    errors.push({ levelId: level.id, code: 'words.duplicates', message: 'Main and bonus words overlap.' });
  }

  for (const word of allWords) {
    if (!canBuildFromLetters(word, level.letters)) {
      errors.push({ levelId: level.id, code: 'word.impossible', message: `${word} cannot be built from level letters.` });
    }
  }

  if (level.rewardCoins < 1) {
    errors.push({ levelId: level.id, code: 'reward.invalid', message: 'Reward must be positive.' });
  }

  return [...errors, ...validateWheelQuality(level), ...validateGrid(level)];
}

export function assertValidLevel(level: Level): void {
  const errors = validateLevel(level);
  if (errors.length > 0) {
    throw new Error(errors.map((error) => `${error.code}: ${error.message}`).join('\n'));
  }
}
