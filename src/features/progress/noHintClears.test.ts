import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSave, loadSave, saveProgress } from './saveState';

describe('no-hint clear persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults noHintClears to zero for old saves', () => {
    window.localStorage.setItem('lexora.save.v1', JSON.stringify({ selectedLanguage: 'en' }));
    expect(loadSave().stats.noHintClears).toBe(0);
  });

  it('persists noHintClears', () => {
    saveProgress({
      ...defaultSave,
      stats: {
        ...defaultSave.stats,
        noHintClears: 3,
      },
    });

    expect(loadSave().stats.noHintClears).toBe(3);
  });
});
