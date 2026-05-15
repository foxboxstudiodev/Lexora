import { LanguageCode } from '../i18n/translations';

export type LanguageProgress = {
  currentLevel: number;
  completed: number[];
};

export type SaveState = {
  version: 1;
  selectedLanguage: LanguageCode;
  coins: number;
  progress: Record<LanguageCode, LanguageProgress>;
};

const SAVE_KEY = 'lexora.save.v1';

const defaultProgress: Record<LanguageCode, LanguageProgress> = {
  en: { currentLevel: 1, completed: [] },
  es: { currentLevel: 1, completed: [] },
  ru: { currentLevel: 1, completed: [] },
  tr: { currentLevel: 1, completed: [] },
};

export const defaultSave: SaveState = {
  version: 1,
  selectedLanguage: 'en',
  coins: 100,
  progress: defaultProgress,
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
    };
  } catch {
    return defaultSave;
  }
}

export function saveProgress(save: SaveState): void {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
