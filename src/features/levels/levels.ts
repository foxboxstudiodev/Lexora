import { LanguageCode } from '../i18n/translations';
import { starterLevels } from './levelPacks';
import { Level } from './types';
import { getBlockingLevelErrors, getExpansionLevelWarnings } from './levelValidator';

function formatIssues(title: string, issues: ReturnType<typeof getBlockingLevelErrors>): string {
  return `${title}:\n${issues.map((item) => `${item.levelId} ${item.code}: ${item.message}`).join('\n')}`;
}

function getValidatedLevels(): Level[] {
  const blockingErrors = starterLevels.flatMap(getBlockingLevelErrors);
  const expansionWarnings = starterLevels.flatMap(getExpansionLevelWarnings);

  if (blockingErrors.length > 0) {
    const message = formatIssues('Lexora level validation failed', blockingErrors);

    if (import.meta.env.DEV) {
      throw new Error(message);
    }

    console.error(message);
  }

  if (expansionWarnings.length > 0 && import.meta.env.DEV) {
    console.warn(formatIssues('Lexora expansion quality warnings', expansionWarnings));
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
