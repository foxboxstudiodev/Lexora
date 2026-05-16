import { ACTIVE_LANGUAGES, ActiveLanguageCode, isActiveLanguageCode } from '../i18n/languages';
import { Level } from './types';

export function isPlayableRuntimeLevel(level: Level): level is Level & { language: ActiveLanguageCode } {
  return isActiveLanguageCode(level.language);
}

export function getPlayableRuntimeLevels(levels: Level[]): Array<Level & { language: ActiveLanguageCode }> {
  return levels.filter(isPlayableRuntimeLevel);
}

export function getPlayableLanguageCodes(): ActiveLanguageCode[] {
  return [...ACTIVE_LANGUAGES];
}
