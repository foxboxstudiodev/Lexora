import { Labels } from '../i18n/translations';
import { UserSettings } from '../progress/saveState';
import { toggleSetting } from './settingsModel';

type SettingsScreenProps = {
  labels: Labels;
  settings: UserSettings;
  onBack: () => void;
  onChange: (settings: UserSettings) => void;
};

function SettingRow({ label, enabled, labels, onToggle }: { label: string; enabled: boolean; labels: Labels; onToggle: () => void }) {
  return (
    <button className={enabled ? 'setting-row enabled' : 'setting-row'} onClick={onToggle}>
      <span>{label}</span>
      <strong>{enabled ? labels.on : labels.off}</strong>
    </button>
  );
}

export function SettingsScreen({ labels, settings, onBack, onChange }: SettingsScreenProps) {
  return (
    <section className="screen-panel settings-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2>{labels.settings}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>{labels.back}</button>
      </div>

      <div className="settings-list">
        <SettingRow
          label={labels.sound}
          labels={labels}
          enabled={settings.soundEnabled}
          onToggle={() => onChange(toggleSetting(settings, 'soundEnabled'))}
        />
        <SettingRow
          label={labels.music}
          labels={labels}
          enabled={settings.musicEnabled}
          onToggle={() => onChange(toggleSetting(settings, 'musicEnabled'))}
        />
        <SettingRow
          label={labels.vibration}
          labels={labels}
          enabled={settings.vibrationEnabled}
          onToggle={() => onChange(toggleSetting(settings, 'vibrationEnabled'))}
        />
      </div>
    </section>
  );
}
