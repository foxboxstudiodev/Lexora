import { describe, expect, it } from 'vitest';
import { createContentPackCoverageReport, createContentPackCoverageRow, formatContentPackCoverageReport } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('reports active language starter coverage', () => {
    const en = createContentPackCoverageRow('en');
    expect(en.status).toBe('active');
    expect(en.targetLevelCount).toBe(300);
    expect(en.readyLevelCount).toBe(3);
    expect(en.missingLevelCount).toBe(297);
    expect(en.missingLevelNumbers[0]).toBe(4);
  });

  it('reports planned languages without packs as empty coverage', () => {
    const de = createContentPackCoverageRow('de');
    expect(de.status).toBe('planned');
    expect(de.targetLevelCount).toBe(300);
    expect(de.readyLevelCount).toBe(0);
    expect(de.missingLevelCount).toBe(300);
  });

  it('builds a full 13-language coverage report', () => {
    const report = createContentPackCoverageReport();

    expect(report.rows).toHaveLength(13);
    expect(report.totalTargetLevels).toBe(3900);
    expect(report.totalReadyLevels).toBe(12);
    expect(report.totalMissingLevels).toBe(3888);
  });

  it('formats the coverage report', () => {
    const formatted = formatContentPackCoverageReport(createContentPackCoverageReport());

    expect(formatted).toContain('LEXORA CONTENT PACK COVERAGE');
    expect(formatted).toContain('Total: 12/3900');
    expect(formatted).toContain('en [active] 3/300');
    expect(formatted).toContain('de [planned] 0/300');
  });
});
