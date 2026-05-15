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
import { DailyRewardState, loadSave, saveProgress, UserSettings } from '../features/progress/saveState';

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

  const updateSettings = (settings: UserSettings) => {
    persist({ ...save, settings });
  };

  const claimDaily = (reward: number, dailyReward: DailyRewardState) => {
    persist({
      ...save,
      coins: save.coins + reward,
      dailyReward,
      stats: {
        ...save.stats,
        coinsEarned: save.stats.coinsEarned + reward,
      },
    });
  };

  const spendCoins = (amount: number): boolean => {
    if (save.coins < amount) return false;
    persist({
      ...save,
      coins: save.coins - amount,
      stats: {
        ...save.stats,
        hintsUsed: save.stats.hintsUsed + 1,
        coinsSpent: save.stats.coinsSpent + amount,
      },
    });
    return true;
  };

  const earnCoins = (amount: number) => {
    persist({
      ...save,
      coins: save.coins + amount,
      stats: {
        ...save.stats,
        bonusWordsFound: save.stats.bonusWordsFound + 1,
        coinsEarned: save.stats.coinsEarned + amount,
      },
    });
  };

  const selectLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    setScreen('game');
  };

  const completeLevel = (stats: LevelCompleteStats) => {
    const completedLevel = activeLevel;
    const current = save.progress[language] ?? { currentLevel: 1, completed: [] };
    const completed = Array.from(new Set([...current.completed, completedLevel.id])).sort((a, b) => a - b);
    const nextLevelId = Math.min(completedLevel.id + 1, levels[levels.length - 1].id);
    const nextSave = {
      ...save,
      coins: save.coins + completedLevel.rewardCoins,
      progress: {
        ...save.progress,
        [language]: {
          currentLevel: Math.max(current.currentLevel, nextLevelId),
          completed,
        },
      },
      stats: {
        ...save.stats,
        wordsFound: save.stats.wordsFound + stats.foundWords,
        levelsCompleted: save.stats.levelsCompleted + 1,
        coinsEarned: save.stats.coinsEarned + completedLevel.rewardCoins,
      },
    };

    setCompletedSummary({
      levelId: completedLevel.id,
      rewardCoins: completedLevel.rewardCoins,
      foundWords: stats.foundWords,
      bonusWords: stats.bonusWords,
    });
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
