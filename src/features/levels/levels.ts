import { LanguageCode } from '../i18n/translations';
import { starterLevels } from './levelPacks';
import { validateLevelPacksByLanguage } from './levelPackValidator';
import { getPlayableRuntimeLevels } from './playableLanguageGuard';
import { Level } from './types';
import { getBlockingLevelErrors, getExpansionLevelWarnings, LevelValidationError } from './levelValidator';

function formatLevelIssues(title: string, issues: LevelValidationError[]): string {
  return `${title}:\n${issues.map((item) => `${item.levelId} ${item.code}: ${item.message}`).join('\n')}`;
}

function formatPackIssues(): string {
  const packReports = validateLevelPacksByLanguage(starterLevels);
  const messages = packReports.flatMap((report) =>
    report.issues.map((issue) =>
      `${report.language} ${issue.code}: ${issue.message} Levels: ${issue.affectedLevelIds.join(', ')}`,
    ),
  );

  return messages.length > 0 ? `Lexora language pack quality warnings:\n${messages.join('\n')}` : '';
}

function getValidatedLevels(): Level[] {
  const blockingErrors = starterLevels.flatMap(getBlockingLevelErrors);
  const expansionWarnings = starterLevels.flatMap(getExpansionLevelWarnings);
  const packWarningMessage = formatPackIssues();

  if (blockingErrors.length > 0) {
    const message = formatLevelIssues('Lexora level validation failed', blockingErrors);

    if (import.meta.env.DEV) {
      throw new Error(message);
    }

    console.error(message);
  }

  if (import.meta.env.DEV) {
    if (expansionWarnings.length > 0) {
      console.warn(formatLevelIssues('Lexora expansion quality warnings', expansionWarnings));
    }

    if (packWarningMessage) {
      console.warn(packWarningMessage);
    }
  }

  return starterLevels;
}

const validatedLevels = getValidatedLevels();
const playableLevels = getPlayableRuntimeLevels(validatedLevels);

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return playableLevels.filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}

export function getAllLevels(): Level[] {
  return [...validatedLevels];
}

export function getAllPlayableLevels(): Level[] {
  return [...playableLevels];
}
