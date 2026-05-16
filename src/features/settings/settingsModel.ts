import { UserSettings } from '../progress/saveState';

export type SettingKey = keyof UserSettings;

export function toggleSetting(settings: UserSettings, key: SettingKey): UserSettings {
  return {
    ...settings,
    [key]: !settings[key],
  };
}

export function areAllSettingsEnabled(settings: UserSettings): boolean {
  return settings.soundEnabled && settings.musicEnabled && settings.vibrationEnabled;
}
