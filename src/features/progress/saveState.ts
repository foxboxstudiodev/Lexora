import { HintType } from '../economy/economy';
import { ACTIVE_LANGUAGES, isActiveLanguageCode, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';

export type LanguageProgress = {
  currentLevel: number;
  completed: number[];
};

export type UserSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
};

export type HintUsageStats = Record<HintType, number>;

export type PlayerStats = {
  wordsFound: number;
  bonusWordsFound: number;
  levelsCompleted: number;
  hintsUsed: number;
  hintsByType: HintUsageStats;
  noHintClears: number;
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

export const defaultHintUsageStats: HintUsageStats = {
  reveal_letter: 0,
  reveal_word_start: 0,
  reveal_word: 0,
};

function createDefaultProgress(): Record<LanguageCode, LanguageProgress> {
  return ACTIVE_LANGUAGES.reduce<Record<LanguageCode, LanguageProgress>>((progress, language) => ({
    ...progress,
    [language]: { currentLevel: 1, completed: [] },
  }), {} as Record<LanguageCode, LanguageProgress>);
}

const defaultProgress: Record<LanguageCode, LanguageProgress> = createDefaultProgress();

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
  hintsByType: defaultHintUsageStats,
  noHintClears: 0,
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
  return typeof value === 'string' && isActiveLanguageCode(value) ? value : 'en';
}

function clampLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1;
  return Math.min(TARGET_LEVELS_PER_LANGUAGE, Math.max(1, Math.floor(value)));
}

function normalizeCompletedLevels(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(
    value
      .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))
      .map((item) => Math.floor(item))
      .filter((item) => item >= 1 && item <= TARGET_LEVELS_PER_LANGUAGE),
  )).sort((a, b) => a - b);
}

function normalizeLanguageProgress(value: Partial<LanguageProgress> | undefined): LanguageProgress {
  return {
    currentLevel: clampLevel(value?.currentLevel),
    completed: normalizeCompletedLevels(value?.completed),
  };
}

function normalizeProgress(progress: Partial<Record<LanguageCode, LanguageProgress>> | undefined): Record<LanguageCode, LanguageProgress> {
  return ACTIVE_LANGUAGES.reduce<Record<LanguageCode, LanguageProgress>>((normalized, language) => ({
    ...normalized,
    [language]: normalizeLanguageProgress(progress?.[language]),
  }), {} as Record<LanguageCode, LanguageProgress>);
}

function normalizeHintUsageStats(hintsByType: Partial<HintUsageStats> | undefined): HintUsageStats {
  return { ...defaultHintUsageStats, ...(hintsByType ?? {}) };
}

function normalizeStats(stats: Partial<PlayerStats> | undefined): PlayerStats {
  return {
    ...defaultStats,
    ...(stats ?? {}),
    hintsByType: normalizeHintUsageStats(stats?.hintsByType),
  };
}

function normalizeSave(parsed: Partial<SaveState>): SaveState {
  return {
    version: 1,
    selectedLanguage: normalizeSelectedLanguage(parsed.selectedLanguage),
    coins: typeof parsed.coins === 'number' ? parsed.coins : 100,
    progress: normalizeProgress(parsed.progress),
    settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    stats: normalizeStats(parsed.stats),
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