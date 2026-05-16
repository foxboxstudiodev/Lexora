import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSave, loadSave, saveProgress } from './saveState';

const saveKey = 'lexora.save.v1';

describe('save state', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads the default save when no saved data exists', () => {
    expect(loadSave()).toEqual(defaultSave);
  });

  it('normalizes partial saved data', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({ selectedLanguage: 'ru', coins: 250 }));

    const save = loadSave();

    expect(save.selectedLanguage).toBe('ru');
    expect(save.coins).toBe(250);
    expect(save.progress.en.currentLevel).toBe(1);
    expect(save.settings.soundEnabled).toBe(true);
    expect(save.stats.wordsFound).toBe(0);
    expect(save.dailyReward.streak).toBe(0);
  });

  it('falls back to English when saved language is planned but not playable', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({ selectedLanguage: 'zh', coins: 250 }));

    const save = loadSave();

    expect(save.selectedLanguage).toBe('en');
    expect(save.coins).toBe(250);
  });

  it('falls back to English when saved language is invalid', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({ selectedLanguage: 'bad-language', coins: 250 }));

    const save = loadSave();

    expect(save.selectedLanguage).toBe('en');
  });

  it('returns default save for invalid JSON', () => {
    window.localStorage.setItem(saveKey, '{broken-json');

    expect(loadSave()).toEqual(defaultSave);
  });

  it('persists save data', () => {
    saveProgress({ ...defaultSave, coins: 333 });

    expect(loadSave().coins).toBe(333);
  });
});
