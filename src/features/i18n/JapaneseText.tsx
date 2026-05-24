import { createJapaneseDisplayTokens, getJapaneseDisplayLabel, JapaneseDisplayMode } from './japaneseDisplayText';

export type JapaneseTextProps = {
  words: string[];
  mode?: JapaneseDisplayMode;
  className?: string;
};

export function JapaneseText({ words, mode = 'plain', className = '' }: JapaneseTextProps) {
  const tokens = createJapaneseDisplayTokens(words);
  const rootClassName = ['japanese-text', className].filter(Boolean).join(' ');

  return (
    <span className={rootClassName} lang="ja">
      {tokens.map((token, index) => {
        const key = `${token.surface}-${index}`;

        if (mode === 'furigana-assisted' && token.furigana) {
          return (
            <span className="japanese-furigana-token" key={key}>
              <ruby>
                {token.surface}
                <rt>{token.furigana.reading}</rt>
              </ruby>
            </span>
          );
        }

        return (
          <span className="japanese-display-token" key={key} aria-label={getJapaneseDisplayLabel(token, mode)}>
            {token.surface}
          </span>
        );
      })}
    </span>
  );
}
