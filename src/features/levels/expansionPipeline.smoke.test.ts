import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES, ALL_LANGUAGES, PLANNED_LANGUAGES } from '../i18n/languages';
import { travelLocations } from '../worlds/travelLocations';
import { sampleExpansionPack } from './sampleExpansionPack';
import { createLevelQualityReport, hasBlockingQualityProblems } from './qualityReport';

describe('expansion pipeline smoke test', () => {
  it('keeps the language roadmap intact', () => {
    expect(ACTIVE_LANGUAGES).toEqual(['en', 'es', 'ru', 'tr']);
    expect(PLANNED_LANGUAGES).toEqual(['de', 'pt', 'it', 'fr', 'az', 'hi', 'zh', 'ja', 'ko']);
    expect(ALL_LANGUAGES).toHaveLength(13);
  });

  it('keeps travel locations available for expansion packs', () => {
    expect(travelLocations.length).toBeGreaterThanOrEqual(10);
    expect(travelLocations.map((location) => location.countryCode)).toEqual(expect.arrayContaining(['EG', 'FR', 'JP', 'AZ', 'CN', 'KR', 'IN']));
  });

  it('builds sample expansion levels into runtime levels with no blocking quality problems', () => {
    expect(sampleExpansionPack.expansionLevels.length).toBe(sampleExpansionPack.runtimeLevels.length);
    expect(sampleExpansionPack.runtimeLevels.length).toBeGreaterThan(0);

    const report = createLevelQualityReport(sampleExpansionPack.runtimeLevels);
    expect(hasBlockingQualityProblems(report)).toBe(false);
  });
});
