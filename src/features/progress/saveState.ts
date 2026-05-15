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

export function loadSave(): SaveState {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave;
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    return {
      version: 1,
      selectedLanguage: parsed.selectedLanguage ?? 'en',
      coins: typeof parsed.coins === 'number' ? parsed.coins : 100,
      progress: { ...defaultProgress, ...(parsed.progress ?? {}) },
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      stats: { ...defaultStats, ...(parsed.stats ?? {}) },
      dailyReward: { ...defaultDailyReward, ...(parsed.dailyReward ?? {}) },
    };
  } catch {
    return defaultSave;
  }
}

export function saveProgress(save: SaveState): void {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
