import { LanguageCode, translations } from '../i18n/translations';

type MainMenuProps = {
  language: LanguageCode;
  coins: number;
  currentLevel: number;
  installAvailable: boolean;
  onLanguages: () => void;
  onPlay: () => void;
  onMap: () => void;
  onExplore: () => void;
  onSettings: () => void;
  onAchievements: () => void;
  onDailyReward: () => void;
  onInstall: () => void;
};

export function MainMenu({ language, coins, currentLevel, installAvailable, onLanguages, onPlay, onMap, onExplore, onSettings, onAchievements, onDailyReward, onInstall }: MainMenuProps) {
  const labels = translations[language];

  return (
    <section className="screen-panel menu-screen" aria-labelledby="main-menu-title">
      <p className="eyebrow">LEXORA</p>
      <h1 id="main-menu-title">{labels.title}</h1>
      <p className="subtitle">{labels.subtitle}</p>

      <div className="stat-grid">
        <div className="stat-card">
          <span>{labels.level}</span>
          <strong>{currentLevel}</strong>
        </div>
        <div className="stat-card">
          <span>{labels.coins}</span>
          <strong>{coins}</strong>
        </div>
      </div>

      <div className="primary-actions">
        <button className="primary-button" onClick={onPlay}>{labels.play}</button>
        <button className="secondary-button" onClick={onLanguages}>{labels.languages}</button>
        <button className="secondary-button" onClick={onMap}>{labels.levels}</button>
        <button className="secondary-button" onClick={onExplore}>{labels.explore}</button>
        <button className="secondary-button" onClick={onDailyReward}>{labels.dailyReward}</button>
        <button className="secondary-button" onClick={onAchievements}>{labels.achievements}</button>
        <button className="secondary-button" onClick={onSettings}>{labels.settings}</button>
        {installAvailable && <button className="secondary-button install-button" onClick={onInstall}>{labels.install}</button>}
      </div>
    </section>
  );
}
