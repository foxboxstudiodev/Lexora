import { useMemo, useState } from 'react';
import { GameScreen } from '../features/game/GameScreen';
import { getLevelsByLanguage } from '../features/levels/levels';
import { LanguageCode, translations } from '../features/i18n/translations';
import { loadSave, saveProgress } from '../features/progress/saveState';

const languages: LanguageCode[] = ['en', 'es', 'ru', 'tr'];

export function App() {
  const [save, setSave] = useState(loadSave);
  const [language, setLanguage] = useState<LanguageCode>(save.selectedLanguage);
  const t = translations[language];
  const levels = useMemo(() => getLevelsByLanguage(language), [language]);
  const languageProgress = save.progress[language] ?? { currentLevel: 1, completed: [] };
  const activeLevel = levels.find((level) => level.id === languageProgress.currentLevel) ?? levels[0];

  const handleLanguageChange = (next: LanguageCode) => {
    const nextSave = { ...save, selectedLanguage: next };
    setLanguage(next);
    setSave(nextSave);
    saveProgress(nextSave);
  };

  const handleLevelComplete = () => {
    const current = save.progress[language] ?? { currentLevel: 1, completed: [] };
    const completed = Array.from(new Set([...current.completed, activeLevel.id])).sort((a, b) => a - b);
    const nextLevelId = Math.min(activeLevel.id + 1, levels[levels.length - 1].id);
    const nextSave = {
      ...save,
      coins: save.coins + activeLevel.rewardCoins,
      progress: {
        ...save.progress,
        [language]: {
          currentLevel: nextLevelId,
          completed,
        },
      },
    };
    setSave(nextSave);
    saveProgress(nextSave);
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="language-row" aria-label="Language selector">
          {languages.map((item) => (
            <button
              key={item}
              className={item === language ? 'language-pill active' : 'language-pill'}
              onClick={() => handleLanguageChange(item)}
            >
              {translations[item].languageName}
            </button>
          ))}
        </div>
      </section>

      <GameScreen
        key={`${language}-${activeLevel.id}`}
        level={activeLevel}
        labels={t}
        coins={save.coins}
        onComplete={handleLevelComplete}
      />
    </main>
  );
}
