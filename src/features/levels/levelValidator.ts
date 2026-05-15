import { Level } from './types';
import { normalizeWord } from '../game/engine';

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

export function validateLevel(level: Level): LevelValidationError[] {
  const errors: LevelValidationError[] = [];
  const mainWords = level.mainWords.map((item) => normalizeWord(item.word));
  const bonusWords = level.bonusWords.map(normalizeWord);
  const allWords = [...mainWords, ...bonusWords];

  if (level.letters.length < 3) {
    errors.push({ levelId: level.id, code: 'letters.too_few', message: 'A level must contain at least 3 letters.' });
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

  return errors;
}

export function assertValidLevel(level: Level): void {
  const errors = validateLevel(level);
  if (errors.length > 0) {
    throw new Error(errors.map((error) => `${error.code}: ${error.message}`).join('\n'));
  }
}
