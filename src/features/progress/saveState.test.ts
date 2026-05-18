import { beforeEach, describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES } from '../i18n/languages';
import { defaultHintUsageStats, defaultSave, loadSave, saveProgress } from './saveState';

const saveKey = 'lexora.save.v1';

describe('save state', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads the default save when no saved data exists', () => {
    expect(loadSave()).toEqual(defaultSave);
  });

  it('creates default progress for every playable language', () => {
    expect(Object.keys(defaultSave.progress).sort()).toEqual([...ACTIVE_LANGUAGES].sort());
    for (const language of ACTIVE_LANGUAGES) {
      expect(defaultSave.progress[language]).toEqual({ currentLevel: 1, completed: [] });
    }
  });

  it('initializes hint usage stats for every supported hint type', () => {
    expect(defaultSave.stats.hintsByType).toEqual(defaultHintUsageStats);
    expect(Object.keys(defaultSave.stats.hintsByType).sort()).toEqual([
      'reveal_letter',
      'reveal_word',
      'reveal_word_start',
    ]);
  });

  it('normalizes partial saved data', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({ selectedLanguage: 'ru', coins: 250 }));

    const save = loadSave();

    expect(save.selectedLanguage).toBe('ru');
    expect(save.coins).toBe(250);
    expect(save.progress.en.currentLevel).toBe(1);
    expect(save.progress.zh.currentLevel).toBe(1);
    expect(save.settings.soundEnabled).toBe(true);
    expect(save.stats.wordsFound).toBe(0);
    expect(save.stats.hintsByType).toEqual(defaultHintUsageStats);
    expect(save.dailyReward.streak).toBe(0);
  });

  it('normalizes broken saved progress into valid 1-300 ranges', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({
      selectedLanguage: 'en',
      progress: {
        en: {
          currentLevel: 999,
          completed: [0, 1, 2, 2, 301, 10.8, Number.NaN, 'bad'],
        },
        ru: {
          currentLevel: -5,
          completed: [-1, 3, 3, 4],
        },
      },
    }));

    const save = loadSave();

    expect(save.progress.en.currentLevel).toBe(300);
    expect(save.progress.en.completed).toEqual([1, 2, 10]);
    expect(save.progress.ru.currentLevel).toBe(1);
    expect(save.progress.ru.completed).toEqual([3, 4]);
  });

  it('normalizes old saves that do not have hint usage by type yet', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({
      selectedLanguage: 'en',
      coins: 80,
      stats: {
        wordsFound: 7,
        bonusWordsFound: 2,
        levelsCompleted: 1,
        hintsUsed: 3,
        noHintClears: 0,
        coinsEarned: 30,
        coinsSpent: 75,
      },
    }));

    const save = loadSave();

    expect(save.stats.hintsUsed).toBe(3);
    expect(save.stats.hintsByType).toEqual(defaultHintUsageStats);
  });

  it('normalizes partial hint usage by type without losing known counters', () => {
    window.localStorage.setItem(saveKey, JSON.stringify({
      selectedLanguage: 'en',
      stats: {
        hintsUsed: 5,
        hintsByType: {
          reveal_letter: 4,
        },
      },
    }));

    const save = loadSave();

    expect(save.stats.hintsByType).toEqual({
      reveal_letter: 4,
      reveal_word_start: 0,
      reveal_word: 0,
    });
  });

  it('keeps every target language selectable from saved data', () => {
    for (const language of ACTIVE_LANGUAGES) {
      window.localStorage.setItem(saveKey, JSON.stringify({ selectedLanguage: language, coins: 250 }));
      expect(loadSave().selectedLanguage).toBe(language);
    }
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
