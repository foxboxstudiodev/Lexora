import { ScriptExposure } from '../levels/contentPackTypes';
import { getJapaneseWordsForProgression, JapaneseProgressionProfile } from './japaneseProgression';
import { JAPANESE_HIRAGANA_ONLY, JAPANESE_KATAKANA_ONLY } from './japaneseWordPolicy';

const KANJI = /[\u4E00-\u9FFF]/u;

export type JapaneseScriptBucket = 'hiragana' | 'katakana' | 'kanji' | 'mixed' | 'other';

export type JapaneseScriptBalanceReport = {
  total: number;
  buckets: Record<JapaneseScriptBucket, number>;
};

export function classifyJapaneseScript(word: string): JapaneseScriptBucket {
  const trimmed = word.trim();

  if (!trimmed) return 'other';
  if (JAPANESE_HIRAGANA_ONLY.test(trimmed)) return 'hiragana';
  if (JAPANESE_KATAKANA_ONLY.test(trimmed)) return 'katakana';
  if (KANJI.test(trimmed) && Array.from(trimmed).every((char) => KANJI.test(char))) return 'kanji';
  if (KANJI.test(trimmed)) return 'mixed';
  return 'other';
}

export function getJapaneseScriptBalance(words: string[]): JapaneseScriptBalanceReport {
  const buckets: Record<JapaneseScriptBucket, number> = {
    hiragana: 0,
    katakana: 0,
    kanji: 0,
    mixed: 0,
    other: 0,
  };

  for (const word of words) {
    buckets[classifyJapaneseScript(word)] += 1;
  }

  return {
    total: words.length,
    buckets,
  };
}

function allowedBucketForScriptExposure(scriptExposure: ScriptExposure): JapaneseScriptBucket[] {
  if (scriptExposure === 'hiragana') return ['hiragana'];
  if (scriptExposure === 'katakana') return ['katakana'];
  if (scriptExposure === 'kana-mixed') return ['hiragana', 'katakana'];
  if (scriptExposure === 'kanji-assisted') return ['hiragana', 'katakana', 'kanji', 'mixed'];
  return ['hiragana', 'katakana', 'kanji', 'mixed'];
}

export function getBalancedJapaneseWordsForProfile(profile: JapaneseProgressionProfile, limit: number): string[] {
  if (limit <= 0) return [];

  const source = getJapaneseWordsForProgression(profile);
  const allowedBuckets = new Set(profile.allowedScripts.flatMap(allowedBucketForScriptExposure));
  const grouped = new Map<JapaneseScriptBucket, string[]>();

  for (const word of source) {
    const bucket = classifyJapaneseScript(word);
    if (!allowedBuckets.has(bucket)) continue;
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), word]);
  }

  const orderedBuckets: JapaneseScriptBucket[] = ['hiragana', 'katakana', 'kanji', 'mixed'];
  const result: string[] = [];
  let index = 0;

  while (result.length < limit) {
    let added = false;

    for (const bucket of orderedBuckets) {
      const words = grouped.get(bucket) ?? [];
      const word = words[index];
      if (word && !result.includes(word)) {
        result.push(word);
        added = true;
        if (result.length >= limit) break;
      }
    }

    if (!added) break;
    index += 1;
  }

  return result;
}
