import { describe, expect, it } from 'vitest';
import { sampleExpansionPack, buildSampleExpansionPack } from './sampleExpansionPack';
import { validateLevelPack } from './levelPackValidator';

function expectPlayableRuntimePack() {
  const pack = buildSampleExpansionPack();

  expect(pack.expansionLevels).toHaveLength(3);
  expect(pack.runtimeLevels).toHaveLength(3);
  expect(pack.runtimeLevels.map((level) => level.id)).toEqual([1, 2, 3]);

  for (const level of pack.runtimeLevels) {
    expect(level.language).toBe('en');
    expect(level.letters.length).toBeGreaterThanOrEqual(5);
    expect(level.mainWords.length).toBeGreaterThanOrEqual(2);
    expect(level.rewardCoins).toBeGreaterThan(0);
  }

  return pack;
}

describe('sample expansion pack', () => {
  it('builds a playable runtime mini-pack through the full expansion pipeline', () => {
    expectPlayableRuntimePack();
  });

  it('exports the prebuilt sample pack', () => {
    expect(sampleExpansionPack.runtimeLevels).toHaveLength(3);
  });

  it('passes pack-level ordered primary word validation', () => {
    const pack = expectPlayableRuntimePack();
    const report = validateLevelPack('en', pack.runtimeLevels);
    expect(report.issues).toEqual([]);
  });

  it('preserves travel metadata in expansion levels', () => {
    const pack = expectPlayableRuntimePack();
    expect(pack.expansionLevels[0].location.countryName).toBe('Egypt');
    expect(pack.expansionLevels[1].location.countryName).toBe('France');
    expect(pack.expansionLevels[2].location.countryName).toBe('Japan');
  });
});
