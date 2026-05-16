import { Labels } from '../i18n/translations';
import { getWorldById } from '../worlds/worlds';
import { getLevelNodeStatus, getWorldProgress, groupLevelsByWorld, isLevelNodePlayable } from './levelMapModel';
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
  const worldSections = groupLevelsByWorld(levels);

  return (
    <section className="screen-panel level-map-screen" aria-labelledby="level-map-title">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2 id="level-map-title">{labels.levels}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack} aria-label={labels.back}>{labels.back}</button>
      </div>

      <div className="world-section-list">
        {worldSections.map((section) => {
          const world = getWorldById(section.themeId);
          const progress = getWorldProgress(section.levels, completed);
          return (
            <section key={`${section.themeId}-${section.levels[0]?.id ?? 0}`} className={`world-section level-theme-${section.themeId}`} aria-label={world.name}>
              <header className="world-section-header">
                <div>
                  <strong>{world.name}</strong>
                  <p>{world.description}</p>
                </div>
                <span aria-label={`Progress ${progress}`}>{progress}</span>
              </header>

              <div className="level-grid compact-grid">
                {section.levels.map((level) => {
                  const status = getLevelNodeStatus(level.id, currentLevel, completed);
                  const isPlayable = isLevelNodePlayable(status);
                  return (
                    <button
                      key={level.id}
                      className={[
                        'level-node',
                        `level-theme-${level.themeId}`,
                        status === 'completed' ? 'completed' : '',
                        status === 'current' ? 'current' : '',
                        status === 'locked' ? 'locked' : '',
                      ].join(' ')}
                      disabled={!isPlayable}
                      title={world.description}
                      aria-label={`${labels.level} ${level.id}, ${world.name}, ${level.difficulty}, ${status}`}
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
        })}
      </div>
    </section>
  );
}
