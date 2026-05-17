import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MainMenu } from './MainMenu';

describe('MainMenu', () => {
  it('renders a single languages entry point', () => {
    const html = renderToStaticMarkup(
      <MainMenu
        language="en"
        coins={100}
        currentLevel={1}
        installAvailable={false}
        onLanguages={() => undefined}
        onPlay={() => undefined}
        onMap={() => undefined}
        onExplore={() => undefined}
        onSettings={() => undefined}
        onAchievements={() => undefined}
        onDailyReward={() => undefined}
        onInstall={() => undefined}
      />,
    );

    expect(html).toContain('Languages');
    expect(html).not.toContain('language-pill');
  });
});
