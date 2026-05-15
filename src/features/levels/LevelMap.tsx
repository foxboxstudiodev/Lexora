import { Labels } from '../i18n/translations';
import { getWorldById } from '../worlds/worlds';
import { Level } from './types';

type WorldSection = {
  themeId: string;
  levels: Level[];
};

type LevelMapProps = {
  labels: Labels;
  levels: Level[];
  currentLevel: number;
  completed: number[];
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
};

function groupLevelsByWorld(levels: Level[]): WorldSection[] {
  const sections: WorldSection[] = [];

  for (const level of levels) {
    const lastSection = sections[sections.length - 1];
    if (lastSection?.themeId === level.themeId) {
      lastSection.levels.push(level);
    } else {
      sections.push({ themeId: level.themeId, levels: [level] });
    }
  }

  return sections;
}

function getWorldProgress(sectionLevels: Level[], completed: number[]): string {
  const completedCount = sectionLevels.filter((level) => completed.includes(level.id)).length;
  return `${completedCount}/${sectionLevels.length}`;
}

export function LevelMap({ labels, levels, currentLevel, completed, onBack, onSelectLevel }: LevelMapProps) {
  const worldSections = groupLevelsByWorld(levels);

  return (
    <section className="screen-panel level-map-screen">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA</p>
          <h2>{labels.levels}</h2>
        </div>
        <button className="secondary-button compact" onClick={onBack}>{labels.back}</button>
      </div>

      <div className="world-section-list">
        {worldSections.map((section) => {
          const world = getWorldById(section.themeId);
          return (
            <section key={`${section.themeId}-${section.levels[0]?.id ?? 0}`} className={`world-section level-theme-${section.themeId}`}>
              <header className="world-section-header">
                <div>
                  <strong>{world.name}</strong>
                  <p>{world.description}</p>
                </div>
                <span>{getWorldProgress(section.levels, completed)}</span>
              </header>

              <div className="level-grid compact-grid">
                {section.levels.map((level) => {
                  const isCompleted = completed.includes(level.id);
                  const isCurrent = level.id === currentLevel;
                  const isUnlocked = isCompleted || isCurrent || level.id <= currentLevel;
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
        })}
      </div>
    </section>
  );
}
