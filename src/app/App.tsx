import { useMemo, useState } from 'react';
import { GameScreen, LevelCompleteStats } from '../features/game/GameScreen';
import { LevelComplete } from '../features/game/LevelComplete';
import { MainMenu } from '../features/menu/MainMenu';
import { LevelMap } from '../features/levels/LevelMap';
import { getLevelsByLanguage } from '../features/levels/levels';
import { LanguageCode, translations } from '../features/i18n/translations';
import { loadSave, saveProgress } from '../features/progress/saveState';

type Screen = 'menu' | 'map' | 'game' | 'complete';

export function App() {
  const [save, setSave] = useState(loadSave);
  const [language, setLanguage] = useState<LanguageCode>(save.selectedLanguage);
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [lastStats, setLastStats] = useState<LevelCompleteStats>({ foundWords: 0, bonusWords: 0 });

  const labels = translations[language];
  const levels = useMemo(() => getLevelsByLanguage(language), [language]);
  const progress = save.progress[language] ?? { currentLevel: 1, completed: [] };
  const activeLevelId = selectedLevelId ?? progress.currentLevel;
  const activeLevel = levels.find((level) => level.id === activeLevelId) ?? levels[0];

  const persist = (nextSave: typeof save) => {
    setSave(nextSave);
    saveProgress(nextSave);
  };

  const handleLanguageChange = (next: LanguageCode) => {
    const nextSave = { ...save, selectedLanguage: next };
    setLanguage(next);
    setSelectedLevelId(null);
    persist(nextSave);
  };

  const selectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    setScreen('game');
  };

  const completeLevel = (stats: LevelCompleteStats) => {
    const current = save.progress[language] ?? { currentLevel: 1, completed: [] };
    const completed = Array.from(new Set([...current.completed, activeLevel.id])).sort((a, b) => a - b);
    const nextLevelId = Math.min(activeLevel.id + 1, levels[levels.length - 1].id);
    const nextSave = {
      ...save,
      coins: save.coins + activeLevel.rewardCoins,
      progress: {
        ...save.progress,
        [language]: {
          currentLevel: Math.max(current.currentLevel, nextLevelId),
          completed,
        },
      },
    };
    setLastStats(stats);
    setSelectedLevelId(nextLevelId);
    persist(nextSave);
    setScreen('complete');
  };

  return (
    <main className="app-shell full-shell">
      {screen === 'menu' && (
        <MainMenu
          language={language}
          coins={save.coins}
          currentLevel={progress.currentLevel}
          onLanguageChange={handleLanguageChange}
          onPlay={() => setScreen('game')}
          onMap={() => setScreen('map')}
        />
      )}

      {screen === 'map' && (
        <LevelMap
          labels={labels}
          levels={levels}
          currentLevel={progress.currentLevel}
          completed={progress.completed}
          onBack={() => setScreen('menu')}
          onSelectLevel={selectLevel}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={`${language}-${activeLevel.id}`}
          level={activeLevel}
          labels={labels}
          coins={save.coins}
          onBackToMap={() => setScreen('map')}
          onComplete={completeLevel}
        />
      )}

      {screen === 'complete' && (
        <LevelComplete
          labels={labels}
          levelId={activeLevel.id - 1 > 0 ? activeLevel.id - 1 : activeLevel.id}
          rewardCoins={activeLevel.rewardCoins}
          foundWords={lastStats.foundWords}
          bonusWords={lastStats.bonusWords}
          onNext={() => setScreen('game')}
          onMap={() => setScreen('map')}
        />
      )}
    </main>
  );
}
