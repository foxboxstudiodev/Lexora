import { normalizeWord } from '../game/engine';
import { getKnownWorldIds } from '../worlds/worlds';
import { Level } from './types';

export type LevelValidationError = {
  levelId: number;
  code: string;
  message: string;
};

function canBuildFromLetters(word: string, letters: string[]): boolean {
  const pool = letters.map(normalizeWord);
  for (const letter of Array.from(normalizeWord(word))) {
    const index = pool.indexOf(letter);
    if (index === -1) return false;
    pool.splice(index, 1);
  }
  return true;
}

function validateGrid(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const occupied = new Map<string, string>();

  for (const placed of level.mainWords) {
    if (placed.row < 0 || placed.col < 0) {
      errors.push({ levelId: level.id, code: 'grid.negative_position', message: `${placed.word} has a negative grid position.` });
      continue;
    }

    const letters = Array.from(normalizeWord(placed.word));
    letters.forEach((letter, index) => {
      const row = placed.direction === 'down' ? placed.row + index : placed.row;
      const col = placed.direction === 'across' ? placed.col + index : placed.col;
      const key = `${row}:${col}`;
      const existing = occupied.get(key);

      if (existing && existing !== letter) {
        errors.push({ levelId: level.id, code: 'grid.letter_conflict', message: `${placed.word} conflicts at ${key}: ${existing} vs ${letter}.` });
      }

      occupied.set(key, letter);
    });
  }

  if (occupied.size === 0) {
    errors.push({ levelId: level.id, code: 'grid.empty', message: 'A level must have at least one crossword cell.' });
  }

  return errors;
}

export function validateLevel(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const knownWorldIds = getKnownWorldIds();
  const mainWords = level.mainWords.map((item) => normalizeWord(item.word));
  const bonusWords = level.bonusWords.map(normalizeWord);
  const allWords = [...mainWords, ...bonusWords];

  if (level.letters.length < 3) {
    errors.push({ levelId: level.id, code: 'letters.too_few', message: 'A level must contain at least 3 letters.' });
  }

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

  return [...errors, ...validateGrid(level)];
}

export function assertValidLevel(level: Level): void {
  const errors = validateLevel(level);
  if (errors.length > 0) {
    throw new Error(errors.map((error) => `${error.code}: ${error.message}`).join('\n'));
  }
}
