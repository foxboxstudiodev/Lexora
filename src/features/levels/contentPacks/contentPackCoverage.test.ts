import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../../i18n/languages';
import { LEXORA_LEVELS_PER_LANGUAGE, LEXORA_TOTAL_RUNTIME_LEVELS } from '../../structure/lexoraStructure';
import { createContentPackCoverageReport, formatContentPackCoverageReport, formatCoveragePercent } from './contentPackCoverage';

describe('content pack coverage report', () => {
  it('calculates 14-language 1000-level coverage', () => {
    const report = createContentPackCoverageReport();

    expect(report.totalTargetLevels).toBe(LEXORA_TOTAL_RUNTIME_LEVELS);
    expect(report.rows).toHaveLength(ALL_LANGUAGES.length);
    expect(report.totalReadyLevels).toBeGreaterThan(0);
    expect(report.totalMissingLevels).toBe(LEXORA_TOTAL_RUNTIME_LEVELS - report.totalReadyLevels);
  });

  it('marks starter playable packs as partial', () => {
    const report = createContentPackCoverageReport();
    const playableRows = report.rows.filter((row) => ['en', 'es', 'ru', 'tr'].includes(row.language));

    expect(playableRows).toHaveLength(4);
    expect(playableRows.every((row) => row.readyLevelCount > 0)).toBe(true);
    expect(playableRows.every((row) => row.readyLevelCount < LEXORA_LEVELS_PER_LANGUAGE)).toBe(true);
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
    expect(formatted).toContain(`en: 3/${LEXORA_LEVELS_PER_LANGUAGE}`);
    expect(formatted).toContain(`de: 0/${LEXORA_LEVELS_PER_LANGUAGE}`);
  });
});
