import { LanguageCode } from '../i18n/translations';
import { getStarterLevels } from './levelPacks';
import { validateLevelPacksByLanguage } from './levelPackValidator';
import { getPlayableRuntimeLevels } from './playableLanguageGuard';
import { Level } from './types';
import { getBlockingLevelErrors, getExpansionLevelWarnings, LevelValidationError } from './levelValidator';

let cachedValidatedLevels: Level[] | null = null;
let cachedPlayableLevels: Level[] | null = null;

function formatLevelIssues(title: string, issues: LevelValidationError[]): string {
  return `${title}:\n${issues.map((item) => `${item.levelId} ${item.code}: ${item.message}`).join('\n')}`;
}

function formatPackIssues(levels: Level[]): string {
  const packReports = validateLevelPacksByLanguage(levels);
  const messages = packReports.flatMap((report) =>
    report.issues.map((issue) =>
      `${report.language} ${issue.code}: ${issue.message} Levels: ${issue.affectedLevelIds.slice(0, 25).join(', ')}${issue.affectedLevelIds.length > 25 ? '...' : ''}`,
    ),
  );

  return messages.length > 0 ? `Lexora language pack quality warnings:\n${messages.join('\n')}` : '';
}

function logDevelopmentWarnings(levels: Level[]): void {
  const expansionWarnings = levels.flatMap(getExpansionLevelWarnings);
  const packWarningMessage = formatPackIssues(levels);

  if (expansionWarnings.length > 0) {
    console.warn(formatLevelIssues('Lexora expansion quality warnings', expansionWarnings.slice(0, 100)));
  }

  if (packWarningMessage) {
    console.warn(packWarningMessage);
  }
}

function assertNoBlockingLevelErrors(levels: Level[]): void {
  const blockingErrors = levels.flatMap(getBlockingLevelErrors);

  if (blockingErrors.length > 0) {
    throw new Error(formatLevelIssues('Lexora level validation failed', blockingErrors.slice(0, 100)));
  }
}

function getValidatedLevels(): Level[] {
  if (cachedValidatedLevels) return cachedValidatedLevels;

  const levels = getStarterLevels();
  assertNoBlockingLevelErrors(levels);

  if (import.meta.env.DEV) {
    logDevelopmentWarnings(levels);
  }

  cachedValidatedLevels = levels;
  return cachedValidatedLevels;
}

function getPlayableLevels(): Level[] {
  if (!cachedPlayableLevels) {
    cachedPlayableLevels = getPlayableRuntimeLevels(getValidatedLevels());
  }

  return cachedPlayableLevels;
}

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return getPlayableLevels().filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}

export function getAllLevels(): Level[] {
  return [...getValidatedLevels()];
}

export function getAllPlayableLevels(): Level[] {
  return [...getPlayableLevels()];
}
