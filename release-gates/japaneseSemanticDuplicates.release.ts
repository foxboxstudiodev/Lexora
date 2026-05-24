import { describe, expect, it } from 'vitest';
import {
  getJapaneseSemanticDuplicateReport,
  getJapaneseSemanticGroup,
  removeJapaneseSemanticDuplicates,
} from '../src/features/i18n/japaneseSemanticDuplicates';

describe('Japanese semantic duplicate release gate', () => {
  it('detects semantic duplicate groups', () => {
    expect(getJapaneseSemanticGroup('猫')?.canonical).toBe('ねこ');
    expect(getJapaneseSemanticGroup('犬')?.canonical).toBe('いぬ');
    expect(getJapaneseSemanticGroup('山')?.canonical).toBe('やま');
  });

  it('removes duplicate semantic variants safely', () => {
    const filtered = removeJapaneseSemanticDuplicates(['ねこ', '猫', 'いぬ', '犬', '山']);

    expect(filtered).toContain('ねこ');
    expect(filtered).toContain('いぬ');
    expect(filtered).toContain('山');
    expect(filtered.includes('猫') && filtered.includes('ねこ')).toBe(false);
  });

  it('builds semantic duplicate reports', () => {
    const report = getJapaneseSemanticDuplicateReport(['ねこ', '猫', 'いぬ', '犬']);

    expect(report.duplicateGroups.length).toBeGreaterThan(0);
    expect(report.duplicateWords).toContain('猫');
    expect(report.duplicateWords).toContain('犬');
  });
});
