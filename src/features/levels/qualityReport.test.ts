import { describe, expect, it } from 'vitest';
import { createLevelQualityReport, formatLevelQualityReport, hasBlockingQualityProblems } from './qualityReport';
import { sampleExpansionPack } from './sampleExpansionPack';

describe('level quality report', () => {
  it('creates a report for a runtime level set', () => {
    const report = createLevelQualityReport(sampleExpansionPack.runtimeLevels);

    expect(report.totalLevels).toBe(3);
    expect(report.levelsByLanguage.en).toBe(3);
    expect(report.blockingErrorCount).toBe(0);
  });

  it('detects blocking quality problems', () => {
    const report = createLevelQualityReport(sampleExpansionPack.runtimeLevels);
    expect(hasBlockingQualityProblems(report)).toBe(false);
  });

  it('formats a human-readable quality report', () => {
    const report = createLevelQualityReport(sampleExpansionPack.runtimeLevels);
    const formatted = formatLevelQualityReport(report);

    expect(formatted).toContain('LEXORA LEVEL QUALITY REPORT');
    expect(formatted).toContain('Total levels: 3');
    expect(formatted).toContain('- en: 3');
  });
});
