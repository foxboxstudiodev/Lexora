import { Labels } from '../i18n/translations';
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
          <h2>{labels.level}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>Back</button>
      </div>

      <div className="level-grid">
        {levels.map((level) => {
          const isCompleted = completed.includes(level.id);
          const isCurrent = level.id === currentLevel;
          const isUnlocked = isCompleted || isCurrent || level.id <= currentLevel;
          return (
            <button
              key={level.id}
              className={['level-node', isCompleted ? 'completed' : '', isCurrent ? 'current' : '', !isUnlocked ? 'locked' : ''].join(' ')}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(level.id)}
            >
              <span>{level.id}</span>
              <small>{level.difficulty}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
