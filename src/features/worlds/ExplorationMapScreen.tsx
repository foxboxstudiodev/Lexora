import { buildExplorationMap, createDefaultExplorationProgress, ExplorationProgress } from './explorationMap';

type ExplorationMapScreenProps = {
  progress?: ExplorationProgress;
  onBack: () => void;
};

function stateLabel(state: string): string {
  if (state === 'completed') return '✓ Completed';
  if (state === 'current') return 'Current';
  return 'Locked';
}

export function ExplorationMapScreen({ progress = createDefaultExplorationProgress(), onBack }: ExplorationMapScreenProps) {
  const countries = buildExplorationMap(progress);

  return (
    <section className="screen-panel exploration-screen" aria-label="Travel exploration map">
      <div className="screen-header">
        <div>
          <p className="eyebrow">LEXORA WORLD</p>
          <h2>Explore</h2>
          <p className="subtitle">Travel through countries, unlock locations and complete word chapters.</p>
        </div>
        <button className="icon-button" type="button" onClick={onBack} aria-label="Back">←</button>
      </div>

      <div className="exploration-country-list">
        {countries.map((country) => (
          <article key={country.countryCode} className="exploration-country-card">
            <div className="exploration-country-header">
              <div>
                <span>{country.countryCode}</span>
                <strong>{country.countryName}</strong>
              </div>
              <small>{country.completedLevelCount}/{country.totalLevelCount}</small>
            </div>

            <div className="exploration-location-list">
              {country.locations.map((location) => (
                <div key={location.id} className={`exploration-location-card ${location.state}`}>
                  <div>
                    <strong>{location.locationName}</strong>
                    <span>{location.chapterName}</span>
                  </div>
                  <small>{stateLabel(location.state)}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
