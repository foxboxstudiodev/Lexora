import { LanguageCode } from '../i18n/translations';
import { starterLevels } from './levelPacks';
import { Level } from './types';

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return starterLevels.filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}

export function getAllLevels(): Level[] {
  return [...starterLevels];
}
