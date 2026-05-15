import { useMemo, useState } from 'react';
import { AchievementsScreen } from '../features/achievements/AchievementsScreen';
import { DailyRewardScreen } from '../features/dailyReward/DailyRewardScreen';
import { GameScreen, LevelCompleteStats } from '../features/game/GameScreen';
import { LevelComplete } from '../features/game/LevelComplete';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { LevelMap } from '../features/levels/LevelMap';
import { getLevelsByLanguage } from '../features/levels/levels';
import { LanguageCode, translations } from '../features/i18n/translations';
import { DailyRewardState, loadSave, SaveState, saveProgress, UserSettings } from '../features/progress/saveState';

type Screen = 'menu' | 'map' | 'game' | 'complete' | 'settings' | 'achievements' | 'daily';

type CompletedLevelSummary = LevelCompleteStats & {
  levelId: number;
  rewardCoins: number;
};

export function App() {
  const [save, setSave] = useState(loadSave);
  const [language, setLanguage] = useState<LanguageCode>(save.selectedLanguage);
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [completedSummary, setCompletedSummary] = useState<CompletedLevelSummary>({
    levelId: 1,
    rewardCoins: 0,
    foundWords: 0,
    bonusWords: 0,
  });

  const labels = translations[language];
  const levels = useMemo(() => getLevelsByLanguage(language), [language]);
  const progress = save.progress[language] ?? { currentLevel: 1, completed: [] };
  const activeLevelId = selectedLevelId ?? progress.currentLevel;
  const activeLevel = levels.find((level) => level.id === activeLevelId) ?? levels[0];

  const updateSave = (producer: (current: SaveState) => SaveState) => {
    setSave((current) => {
      const nextSave = producer(current);
      saveProgress(nextSave);
      return nextSave;
    });
  };

  const handleLanguageChange = (next: LanguageCode) => {
    setLanguage(next);
    setSelectedLevelId(null);
    updateSave((current) => ({ ...current, selectedLanguage: next }));
  };

  const updateSettings = (settings: UserSettings) => {
    updateSave((current) => ({ ...current, settings }));
  };

  const claimDaily = (reward: number, dailyReward: DailyRewardState) => {
    updateSave((current) => ({
      ...current,
      coins: current.coins + reward,
      dailyReward,
      stats: {
        ...current.stats,
        coinsEarned: current.stats.coinsEarned + reward,
      },
    }));
  };

  const spendCoins = (amount: number): boolean => {
    if (save.coins < amount) return false;
    updateSave((current) => {
      if (current.coins < amount) return current;
      return {
        ...current,
        coins: current.coins - amount,
        stats: {
          ...current.stats,
          hintsUsed: current.stats.hintsUsed + 1,
          coinsSpent: current.stats.coinsSpent + amount,
        },
      };
    });
    return true;
  };

  const earnCoins = (amount: number) => {
    updateSave((current) => ({
      ...current,
      coins: current.coins + amount,
      stats: {
        ...current.stats,
        bonusWordsFound: current.stats.bonusWordsFound + 1,
        coinsEarned: current.stats.coinsEarned + amount,
      },
    }));
  };

  const selectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    setScreen('game');
  };

  const completeLevel = (stats: LevelCompleteStats) => {
    const completedLevel = activeLevel;
    const nextLevelId = Math.min(completedLevel.id + 1, levels[levels.length - 1].id);

    setCompletedSummary({
      levelId: completedLevel.id,
      rewardCoins: completedLevel.rewardCoins,
      foundWords: stats.foundWords,
      bonusWords: stats.bonusWords,
    });
    setSelectedLevelId(nextLevelId);

    updateSave((currentSave) => {
      const current = currentSave.progress[language] ?? { currentLevel: 1, completed: [] };
      const completed = Array.from(new Set([...current.completed, completedLevel.id])).sort((a, b) => a - b);

      return {
        ...currentSave,
        coins: currentSave.coins + completedLevel.rewardCoins,
        progress: {
          ...currentSave.progress,
          [language]: {
            currentLevel: Math.max(current.currentLevel, nextLevelId),
            completed,
          },
        },
        stats: {
          ...currentSave.stats,
          wordsFound: currentSave.stats.wordsFound + stats.foundWords,
          levelsCompleted: currentSave.stats.levelsCompleted + 1,
          coinsEarned: currentSave.stats.coinsEarned + completedLevel.rewardCoins,
        },
      };
    });

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
          onSettings={() => setScreen('settings')}
          onAchievements={() => setScreen('achievements')}
          onDailyReward={() => setScreen('daily')}
        />
      )}

      {screen === 'daily' && (
        <DailyRewardScreen labels={labels} dailyReward={save.dailyReward} onBack={() => setScreen('menu')} onClaim={claimDaily} />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen labels={labels} stats={save.stats} onBack={() => setScreen('menu')} />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          labels={labels}
          settings={save.settings}
          onBack={() => setScreen('menu')}
          onChange={updateSettings}
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
          soundEnabled={save.settings.soundEnabled}
          vibrationEnabled={save.settings.vibrationEnabled}
          onBackToMap={() => setScreen('map')}
          onSpendCoins={spendCoins}
          onEarnCoins={earnCoins}
          onComplete={completeLevel}
        />
      )}

      {screen === 'complete' && (
        <LevelComplete
          labels={labels}
          levelId={completedSummary.levelId}
          rewardCoins={completedSummary.rewardCoins}
          foundWords={completedSummary.foundWords}
          bonusWords={completedSummary.bonusWords}
          onNext={() => setScreen('game')}
          onMap={() => setScreen('map')}
        />
      )}
    </main>
  );
}
