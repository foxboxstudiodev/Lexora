import { isActiveLanguageCode } from '../i18n/languages';
import { LanguageCode } from '../i18n/translations';

export type LanguageProgress = {
  currentLevel: number;
  completed: number[];
};

export type UserSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
};

export type PlayerStats = {
  wordsFound: number;
  bonusWordsFound: number;
  levelsCompleted: number;
  hintsUsed: number;
  coinsEarned: number;
  coinsSpent: number;
};

export type DailyRewardState = {
  lastClaimDate: string | null;
  streak: number;
};

export type SaveState = {
  version: 1;
  selectedLanguage: LanguageCode;
  coins: number;
  progress: Record<LanguageCode, LanguageProgress>;
  settings: UserSettings;
  stats: PlayerStats;
  dailyReward: DailyRewardState;
};

const SAVE_KEY = 'lexora.save.v1';

const defaultProgress: Record<LanguageCode, LanguageProgress> = {
  en: { currentLevel: 1, completed: [] },
  es: { currentLevel: 1, completed: [] },
  ru: { currentLevel: 1, completed: [] },
  tr: { currentLevel: 1, completed: [] },
};

const defaultSettings: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
};

const defaultStats: PlayerStats = {
  wordsFound: 0,
  bonusWordsFound: 0,
  levelsCompleted: 0,
  hintsUsed: 0,
  coinsEarned: 0,
  coinsSpent: 0,
};

const defaultDailyReward: DailyRewardState = {
  lastClaimDate: null,
  streak: 0,
};

export const defaultSave: SaveState = {
  version: 1,
  selectedLanguage: 'en',
  coins: 100,
  progress: defaultProgress,
  settings: defaultSettings,
  stats: defaultStats,
  dailyReward: defaultDailyReward,
};

function canUseLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.localStorage) return false;
    const testKey = 'lexora.storage.test';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function normalizeSelectedLanguage(value: unknown): LanguageCode {
  return typeof value === 'string' && isActiveLanguageCode(value as never) ? (value as LanguageCode) : 'en';
}

function normalizeSave(parsed: Partial<SaveState>): SaveState {
  return {
    version: 1,
    selectedLanguage: normalizeSelectedLanguage(parsed.selectedLanguage),
    coins: typeof parsed.coins === 'number' ? parsed.coins : 100,
    progress: { ...defaultProgress, ...(parsed.progress ?? {}) },
    settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    stats: { ...defaultStats, ...(parsed.stats ?? {}) },
    dailyReward: { ...defaultDailyReward, ...(parsed.dailyReward ?? {}) },
  };
}

export function loadSave(): SaveState {
  try {
    if (!canUseLocalStorage()) return defaultSave;
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave;
    return normalizeSave(JSON.parse(raw) as Partial<SaveState>);
  } catch {
    return defaultSave;
  }
}

export function saveProgress(save: SaveState): void {
  try {
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    console.warn('Lexora progress could not be saved.');
  }
}
