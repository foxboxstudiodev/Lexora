import { isActiveLanguageCode } from '../i18n/languages';
import { Level } from './types';
import { ExpansionLevel } from './expansionLevelTypes';

function mapDifficulty(level: ExpansionLevel): Level['difficulty'] {
  if (level.difficultyBand === 'easy' || level.difficultyBand === 'light-medium') return 'easy';
  if (level.difficultyBand === 'medium') return 'normal';
  return 'hard';
}

export function expansionLevelToRuntimeLevel(level: ExpansionLevel): Level {
  if (!isActiveLanguageCode(level.language)) {
    throw new Error(`Cannot adapt planned language ${level.language} to runtime level before translations and playable packs are active.`);
  }

  return {
    id: level.packLevelNumber,
    language: level.language,
    letters: level.letters,
    mainWords: level.mainWords.map(({ word, row, col, direction }) => ({ word, row, col, direction })),
    bonusWords: level.bonusWords,
    difficulty: mapDifficulty(level),
    themeId: 'dawn-garden',
    rewardCoins: level.rewardCoins,
  };
}

export function expansionLevelsToRuntimeLevels(levels: ExpansionLevel[]): Level[] {
  return levels
    .map(expansionLevelToRuntimeLevel)
    .sort((a, b) => a.id - b.id);
}
