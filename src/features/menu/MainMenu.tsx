import { LanguageCode, translations } from '../i18n/translations';

const languages: LanguageCode[] = ['en', 'es', 'ru', 'tr'];

type MainMenuProps = {
  language: LanguageCode;
  coins: number;
  currentLevel: number;
  onLanguageChange: (language: LanguageCode) => void;
  onPlay: () => void;
  onMap: () => void;
  onSettings: () => void;
  onAchievements: () => void;
};

export function MainMenu({ language, coins, currentLevel, onLanguageChange, onPlay, onMap, onSettings, onAchievements }: MainMenuProps) {
  const labels = translations[language];

  return (
    <section className="screen-panel menu-screen">
      <p className="eyebrow">LEXORA</p>
      <h1>{labels.title}</h1>
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

      <div className="language-row" aria-label="Language selector">
        {languages.map((item) => (
          <button
            key={item}
            className={item === language ? 'language-pill active' : 'language-pill'}
            onClick={() => onLanguageChange(item)}
          >
            {translations[item].languageName}
          </button>
        ))}
      </div>

      <div className="primary-actions">
        <button className="primary-button" onClick={onPlay}>Play</button>
        <button className="secondary-button" onClick={onMap}>{labels.levels}</button>
        <button className="secondary-button" onClick={onAchievements}>{labels.achievements}</button>
        <button className="secondary-button" onClick={onSettings}>{labels.settings}</button>
      </div>
    </section>
  );
}
