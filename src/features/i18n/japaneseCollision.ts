import { analyzeJapaneseWords, JapaneseMorphologyToken } from './japaneseMorphology';

export type JapaneseCollisionKind = 'same-reading-different-surface' | 'duplicate-surface' | 'unknown-token';

export type JapaneseCollision = {
  kind: JapaneseCollisionKind;
  reading?: string;
  words: string[];
};

export type JapaneseCollisionReport = {
  collisions: JapaneseCollision[];
  hasBlockingCollision: boolean;
};

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return grouped;
}

export function detectJapaneseCollisions(words: string[]): JapaneseCollisionReport {
  const tokens = analyzeJapaneseWords(words);
  const collisions: JapaneseCollision[] = [];

  for (const [surface, groupedTokens] of groupBy(tokens, (token) => token.surface)) {
    if (groupedTokens.length > 1) {
      collisions.push({
        kind: 'duplicate-surface',
        words: [surface],
      });
    }
  }

  for (const [reading, groupedTokens] of groupBy(tokens, (token) => token.normalizedReading)) {
    const uniqueSurfaces = Array.from(new Set(groupedTokens.map((token) => token.surface)));
    if (uniqueSurfaces.length > 1) {
      collisions.push({
        kind: 'same-reading-different-surface',
        reading,
        words: uniqueSurfaces,
      });
    }
  }

  const unknownWords = tokens
    .filter((token: JapaneseMorphologyToken) => token.lexicalClass === 'unknown')
    .map((token) => token.surface);

  if (unknownWords.length > 0) {
    collisions.push({
      kind: 'unknown-token',
      words: Array.from(new Set(unknownWords)),
    });
  }

  return {
    collisions,
    hasBlockingCollision: collisions.some((collision) => collision.kind !== 'same-reading-different-surface'),
  };
}

export function hasJapaneseBlockingCollision(words: string[]): boolean {
  return detectJapaneseCollisions(words).hasBlockingCollision;
}
