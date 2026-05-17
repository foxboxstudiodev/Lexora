import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../i18n/languages';
import { translations } from '../i18n/translations';
import { LanguagesScreen } from './LanguagesScreen';

describe('LanguagesScreen', () => {
  it('renders all playable languages', () => {
    const html = renderToStaticMarkup(
      <LanguagesScreen language="en" onLanguageChange={() => undefined} onBack={() => undefined} />,
    );

    for (const language of ALL_LANGUAGES) {
      expect(html).toContain(translations[language].languageName);
      expect(html).toContain(language.toUpperCase());
    }
  });

  it('marks selected language as active', () => {
    const html = renderToStaticMarkup(
      <LanguagesScreen language="zh" onLanguageChange={() => undefined} onBack={() => undefined} />,
    );

    expect(html).toContain('language-card active');
    expect(html).toContain('中文');
  });
});
