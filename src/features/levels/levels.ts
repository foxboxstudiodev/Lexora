import { LanguageCode } from '../i18n/translations';
import { starterLevels } from './levelPacks';
import { Level } from './types';
import { validateLevel } from './levelValidator';

function getValidatedLevels(): Level[] {
  const invalid = starterLevels.flatMap(validateLevel);

  if (invalid.length > 0) {
    console.warn('Lexora level validation warnings:', invalid);
  }

  return starterLevels;
}

const validatedLevels = getValidatedLevels();

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return validatedLevels.filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}

export function getAllLevels(): Level[] {
  return [...validatedLevels];
}
