import { describe, expect, it } from 'vitest';
import { LanguageContentPack } from './contentPackTypes';
import { isContentPackValid, validateContentPack } from './contentPackValidator';

const validPack: LanguageContentPack = {
  language: 'en',
  targetLevelCount: 300,
  entries: [
    {
      packLevelNumber: 1,
      words: ['STONE', 'TONE', 'ONE'],
      bonusWords: ['NOTE'],
      locationId: 'eg-giza-pyramids',
    },
  ],
};

describe('content pack validator', () => {
  it('accepts a valid source content pack', () => {
    const report = validateContentPack(validPack);
    expect(report.errorCount).toBe(0);
    expect(isContentPackValid(report)).toBe(true);
  });

  it('warns when target level count is not 300', () => {
    const report = validateContentPack({ ...validPack, targetLevelCount: 3 });
    expect(report.errorCount).toBe(0);
    expect(report.issues.map((issue) => issue.code)).toContain('content.target_count.not_300');
  });

  it('rejects duplicate source level numbers', () => {
    const report = validateContentPack({
      ...validPack,
      entries: [validPack.entries[0], validPack.entries[0]],
    });

    expect(report.issues.map((issue) => issue.code)).toContain('content.level_number.duplicate');
    expect(isContentPackValid(report)).toBe(false);
  });

  it('rejects invalid source level numbers', () => {
    const report = validateContentPack({
      ...validPack,
      entries: [{ ...validPack.entries[0], packLevelNumber: 301 }],
    });

    expect(report.issues.map((issue) => issue.code)).toContain('content.level_number.invalid');
  });

  it('rejects entries with too few words', () => {
    const report = validateContentPack({
      ...validPack,
      entries: [{ ...validPack.entries[0], words: ['STONE'] }],
    });

    expect(report.issues.map((issue) => issue.code)).toContain('content.words.too_few');
  });

  it('rejects unknown locations', () => {
    const report = validateContentPack({
      ...validPack,
      entries: [{ ...validPack.entries[0], locationId: 'unknown-location' }],
    });

    expect(report.issues.map((issue) => issue.code)).toContain('content.location.unknown');
  });
});
