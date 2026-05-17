import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES } from '../i18n/languages';
import { createContentPackCoverageReport, createContentPackCoverageRow } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('reports full coverage for every active language', () => {
    for (const language of ACTIVE_LANGUAGES) {
      const row = createContentPackCoverageRow(language);
      expect(row.status).toBe('active');
      expect(row.readyLevelCount).toBe(300);
      expect(row.missingLevelCount).toBe(0);
      expect(row.missingLevelNumbers).toEqual([]);
    }
  });

  it('builds complete coverage for all languages', () => {
    const report = createContentPackCoverageReport();
    expect(report.rows).toHaveLength(13);
    expect(report.totalTargetLevels).toBe(3900);
    expect(report.totalReadyLevels).toBe(3900);
    expect(report.totalMissingLevels).toBe(0);
    expect(report.totalCompletionRate).toBe(1);
  });
});
