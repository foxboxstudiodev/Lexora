import { getJapaneseFuriganaToken, JapaneseFuriganaToken } from './japaneseFurigana';
import { normalizeJapaneseKana } from './japaneseWordPolicy';

export type JapaneseDisplayMode = 'plain' | 'furigana-assisted';

export type JapaneseDisplayToken = {
  surface: string;
  normalizedReading: string;
  furigana?: JapaneseFuriganaToken;
};

export function createJapaneseDisplayToken(surface: string): JapaneseDisplayToken {
  const trimmed = surface.trim();
  const furigana = getJapaneseFuriganaToken(trimmed) ?? undefined;

  return {
    surface: trimmed,
    normalizedReading: furigana?.reading ?? normalizeJapaneseKana(trimmed),
    furigana,
  };
}

export function createJapaneseDisplayTokens(words: string[]): JapaneseDisplayToken[] {
  return words.map(createJapaneseDisplayToken);
}

export function getJapaneseDisplayLabel(token: JapaneseDisplayToken, mode: JapaneseDisplayMode = 'plain'): string {
  if (mode === 'furigana-assisted' && token.furigana) {
    return `${token.surface}（${token.furigana.reading}）`;
  }

  return token.surface;
}

export function getJapaneseDisplayLabels(words: string[], mode: JapaneseDisplayMode = 'plain'): string[] {
  return createJapaneseDisplayTokens(words).map((token) => getJapaneseDisplayLabel(token, mode));
}
