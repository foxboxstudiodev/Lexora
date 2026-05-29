import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES } from '../i18n/languages';
import { LEXORA_LEVELS_PER_LANGUAGE, LEXORA_TOTAL_RUNTIME_LEVELS } from '../structure/lexoraStructure';
import { createContentPackCoverageReport, createContentPackCoverageRow } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('reports full coverage for every active language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const row = createContentPackCoverageRow(language);
      expect(row.status).toBe('active');
      expect(row.readyLevelCount).toBe(LEXORA_LEVELS_PER_LANGUAGE);
      expect(row.missingLevelCount).toBe(0);
      expect(row.missingLevelNumbers).toEqual([]);
    }
  });

  it('builds complete coverage for all languages', () => {
    const report = createContentPackCoverageReport();
    expect(report.rows).toHaveLength(ACTIVE_LANGUAGES.length);
    expect(report.totalTargetLevels).toBe(LEXORA_TOTAL_RUNTIME_LEVELS);
    expect(report.totalReadyLevels).toBe(LEXORA_TOTAL_RUNTIME_LEVELS);
    expect(report.totalMissingLevels).toBe(0);
    expect(report.totalCompletionRate).toBe(1);
  });
});
