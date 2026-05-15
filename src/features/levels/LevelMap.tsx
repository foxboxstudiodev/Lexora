import { Labels } from '../i18n/translations';
import { getWorldById } from '../worlds/worlds';
import { Level } from './types';

type LevelMapProps = {
  labels: Labels;
  levels: Level[];
  currentLevel: number;
  completed: number[];
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
};

export function LevelMap({ labels, levels, currentLevel, completed, onBack, onSelectLevel }: LevelMapProps) {
  return (
    <section className="screen-panel level-map-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2>{labels.levels}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>{labels.back}</button>
      </div>

      <div className="level-grid">
        {levels.map((level) => {
          const isCompleted = completed.includes(level.id);
          const isCurrent = level.id === currentLevel;
          const isUnlocked = isCompleted || isCurrent || level.id <= currentLevel;
          const world = getWorldById(level.themeId);
          return (
            <button
              key={level.id}
              className={['level-node', `level-theme-${level.themeId}`, isCompleted ? 'completed' : '', isCurrent ? 'current' : '', !isUnlocked ? 'locked' : ''].join(' ')}
              disabled={!isUnlocked}
              title={world.description}
              onClick={() => onSelectLevel(level.id)}
            >
              <span>{level.id}</span>
              <small>{world.name}</small>
              <em>{level.difficulty}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}
