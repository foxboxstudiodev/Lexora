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
      `${report.language} ${issue.code}: ${issue.message} Levels: ${issue.affectedLevelIds.slice(0, 25).join(', ')}${issue.affectedLevelIds.length > 25 ? '...' : ''}`,
    ),
  );

  return messages.length > 0 ? `Lexora language pack quality warnings:\n${messages.join('\n')}` : '';
}

function logDevelopmentWarnings(): void {
  const expansionWarnings = starterLevels.flatMap(getExpansionLevelWarnings);
  const packWarningMessage = formatPackIssues();

  if (expansionWarnings.length > 0) {
    console.warn(formatLevelIssues('Lexora expansion quality warnings', expansionWarnings.slice(0, 100)));
  }

  if (packWarningMessage) {
    console.warn(packWarningMessage);
  }
}

function getValidatedLevels(): Level[] {
  const blockingErrors = starterLevels.flatMap(getBlockingLevelErrors);

  if (blockingErrors.length > 0) {
    console.error(formatLevelIssues('Lexora level validation failed', blockingErrors.slice(0, 100)));
  }

  if (import.meta.env.DEV) {
    logDevelopmentWarnings();
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
