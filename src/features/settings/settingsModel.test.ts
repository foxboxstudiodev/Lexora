import { describe, expect, it } from 'vitest';
import { areAllSettingsEnabled, toggleSetting } from './settingsModel';
import { UserSettings } from '../progress/saveState';

const enabledSettings: UserSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
};

describe('settings model', () => {
  it('toggles sound setting without mutating the original object', () => {
    const next = toggleSetting(enabledSettings, 'soundEnabled');

    expect(next.soundEnabled).toBe(false);
    expect(next.musicEnabled).toBe(true);
    expect(next.vibrationEnabled).toBe(true);
    expect(enabledSettings.soundEnabled).toBe(true);
  });

  it('toggles music setting', () => {
    const next = toggleSetting(enabledSettings, 'musicEnabled');
    expect(next.musicEnabled).toBe(false);
  });

  it('toggles vibration setting', () => {
    const next = toggleSetting(enabledSettings, 'vibrationEnabled');
    expect(next.vibrationEnabled).toBe(false);
  });

  it('detects whether all settings are enabled', () => {
    expect(areAllSettingsEnabled(enabledSettings)).toBe(true);
    expect(areAllSettingsEnabled({ ...enabledSettings, soundEnabled: false })).toBe(false);
  });
});
