import { LEXORA_LEVELS_PER_LANGUAGE } from '../structure/lexoraStructure';
import { getKnownTravelLocationIds } from '../worlds/travelLocations';
import { LanguageContentPack } from './contentPackTypes';
import { isValidFullPackLevelNumber } from './difficultyProgression';

export type ContentPackValidationIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ContentPackValidationReport = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: ContentPackValidationIssue[];
};

function issue(code: string, message: string, severity: ContentPackValidationIssue['severity']): ContentPackValidationIssue {
  return { code, message, severity };
}

export function validateContentPack(pack: LanguageContentPack): ContentPackValidationReport {
  const issues: ContentPackValidationIssue[] = [];
  const knownLocationIds = getKnownTravelLocationIds();
  const seenLevels = new Set<number>();

  if (pack.targetLevelCount !== LEXORA_LEVELS_PER_LANGUAGE) {
    issues.push(issue(
      'content.target_count.not_1000',
      `Language packs must target exactly ${LEXORA_LEVELS_PER_LANGUAGE} levels.`,
      'error',
    ));
  }

  for (const entry of pack.entries) {
    if (!isValidFullPackLevelNumber(entry.packLevelNumber)) {
      issues.push(issue('content.level_number.invalid', `Invalid level number: ${entry.packLevelNumber}.`, 'error'));
    }

    if (seenLevels.has(entry.packLevelNumber)) {
      issues.push(issue('content.level_number.duplicate', `Duplicate level number: ${entry.packLevelNumber}.`, 'error'));
    }
    seenLevels.add(entry.packLevelNumber);

    if (entry.words.length < 2) {
      issues.push(issue('content.words.too_few', `Level ${entry.packLevelNumber} must contain at least two source words.`, 'error'));
    }

    if (entry.words.some((word) => word.trim().length === 0)) {
      issues.push(issue('content.words.empty', `Level ${entry.packLevelNumber} contains an empty word.`, 'error'));
    }

    if (!knownLocationIds.has(entry.locationId)) {
      issues.push(issue('content.location.unknown', `Unknown location id: ${entry.locationId}.`, 'error'));
    }
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((item) => item.severity === 'error').length,
    warningCount: issues.filter((item) => item.severity === 'warning').length,
    issues,
  };
}

export function isContentPackValid(report: ContentPackValidationReport): boolean {
  return report.errorCount === 0;
}
