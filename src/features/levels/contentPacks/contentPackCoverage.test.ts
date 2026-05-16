import { describe, expect, it } from 'vitest';
import { createContentPackCoverageReport, formatContentPackCoverageReport, formatCoveragePercent } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('calculates full 13-language coverage', () => {
    const report = createContentPackCoverageReport();

    expect(report.totalTargetLevels).toBe(3900);
    expect(report.totalReadyLevels).toBe(12);
    expect(report.totalMissingLevels).toBe(3888);
    expect(report.rows).toHaveLength(13);
  });

  it('marks starter playable packs as partial', () => {
    const report = createContentPackCoverageReport();
    const playableRows = report.rows.filter((row) => ['en', 'es', 'ru', 'tr'].includes(row.language));

    expect(playableRows).toHaveLength(4);
    expect(playableRows.every((row) => row.readyLevelCount === 3)).toBe(true);
    expect(playableRows.every((row) => row.status === 'partial')).toBe(true);
  });

  it('marks planned packs without content as missing', () => {
    const report = createContentPackCoverageReport();
    const zh = report.rows.find((row) => row.language === 'zh');

    expect(zh?.readyLevelCount).toBe(0);
    expect(zh?.status).toBe('missing');
  });

  it('formats percentages and readable reports', () => {
    expect(formatCoveragePercent(0.125)).toBe('12.50%');

    const formatted = formatContentPackCoverageReport(createContentPackCoverageReport(['en', 'de']));
    expect(formatted).toContain('LEXORA CONTENT PACK COVERAGE');
    expect(formatted).toContain('en: 3/300');
    expect(formatted).toContain('de: 0/300');
  });
});
