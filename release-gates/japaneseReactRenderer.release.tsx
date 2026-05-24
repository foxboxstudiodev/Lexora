import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JapaneseText } from '../src/features/i18n/JapaneseText';

describe('Japanese React renderer release gate', () => {
  it('renders plain Japanese text safely', () => {
    const html = renderToStaticMarkup(
      <JapaneseText words={['ねこ', 'いぬ']} mode="plain" />,
    );

    expect(html).toContain('ねこ');
    expect(html).toContain('いぬ');
    expect(html).toContain('japanese-text');
  });

  it('renders furigana-assisted Japanese ruby text', () => {
    const html = renderToStaticMarkup(
      <JapaneseText words={['山', '川', '猫']} mode="furigana-assisted" />,
    );

    expect(html).toContain('<ruby>');
    expect(html).toContain('<rt>やま</rt>');
    expect(html).toContain('<rt>かわ</rt>');
    expect(html).toContain('<rt>ねこ</rt>');
  });

  it('renders mixed Japanese scripts without crashing', () => {
    const html = renderToStaticMarkup(
      <JapaneseText words={['山', 'ゲーム', 'ねこ']} mode="furigana-assisted" />,
    );

    expect(html).toContain('ゲーム');
    expect(html).toContain('山');
    expect(html).toContain('ねこ');
  });
});
