export const JAPANESE_HIRAGANA_ONLY = /^[ぁ-ゖー]+$/u;
export const JAPANESE_KATAKANA_ONLY = /^[ァ-ヺー]+$/u;
export const JAPANESE_KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/u;

const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const HIRAGANA_OFFSET = 0x60;

export const REJECTED_JAPANESE_WORDS = new Set([
  'やち',
  'ぜか',
  'りか',
  'なわ',
  'ちま',
  'まね',
  'まなび',
  'たべる',
  'のむ',
  'みる',
  'きく',
  'よむ',
  'かく',
  'いく',
  'くる',
  'する',
  'ねる',
  'おきる',
  'あるく',
  'はしる',
  'おおきい',
  'ちいさい',
  'あたらしい',
  'ふるい',
  'たのしい',
  'かなしい',
  'しずか',
  'にぎやか',
]);

export function normalizeJapaneseKana(value: string): string {
  return Array.from(value.trim().normalize('NFKC'))
    .map((char) => {
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) return char;
      if (codePoint >= KATAKANA_START && codePoint <= KATAKANA_END) {
        return String.fromCodePoint(codePoint - HIRAGANA_OFFSET);
      }
      return char;
    })
    .join('');
}

export function isBeginnerJapaneseHiraganaWord(value: string): boolean {
  const normalized = normalizeJapaneseKana(value);
  return normalized.length >= 2 && JAPANESE_HIRAGANA_ONLY.test(normalized) && !REJECTED_JAPANESE_WORDS.has(normalized);
}

export function assertBeginnerJapaneseHiraganaWord(value: string): void {
  const normalized = normalizeJapaneseKana(value);

  if (!JAPANESE_HIRAGANA_ONLY.test(normalized)) {
    throw new Error(`Japanese beginner word must be hiragana-only: ${value}`);
  }

  if (normalized.length < 2) {
    throw new Error(`Japanese beginner word must contain at least two kana: ${value}`);
  }

  if (REJECTED_JAPANESE_WORDS.has(normalized)) {
    throw new Error(`Rejected Japanese word is not allowed: ${value}`);
  }
}
