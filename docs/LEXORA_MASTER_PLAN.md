# Lexora Master Plan

Status: ACTIVE.

This document is the single source of truth for Lexora development. All older roadmap documents are deprecated. If any old instruction conflicts with this file, this file wins.

## Rules

1. Game screen must fit on all Android phones without vertical or horizontal scrolling. The full gameplay screen must be visible at once.

2. All 3900 levels must be real. Seed-expanded, repeated, fake, or placeholder levels are not acceptable for final release.

3. Dictionaries must be real, deep, professional, and language-correct. All playable words must be nouns only.

4. Level repetition is forbidden. No repeated word sets, repeated structures, obvious rotations, or similar-feeling levels.

5. Localization must be 100% complete for all 13 languages. No accidental English text in non-English UI.

6. Word quality validation must reject garbage, strange, fake, offensive, duplicate, non-noun, or incorrect words.

7. Travel backgrounds must work in gameplay. Location prompts alone are not enough; real visual assets must be used.

8. Explore screen must be connected to real player progress: countries, locations, locks, current state, and completion.

9. Achievement `no_hint_clear` must be fixed and backed by saved real statistics.

10. Hint economy must be completed. Coins must never be subtracted unless a hint is actually applied successfully.

11. Error/feedback system must be expanded: invalid word, already found, too short, not in puzzle, bonus word, no hint, not enough coins, interrupted swipe, and other states.

12. Vercel production build must not be weaker than strict verification. Deployment must be protected by meaningful checks.

13. Real mobile QA is required for touch, swipe, wheel size, letter size, grid scaling, accidental scroll, and Android behavior.

14. Android/Play Market packaging must be completed: AAB/TWA or Capacitor, icons, screenshots, privacy policy, content rating, and Play Console readiness.

15. Backgrounds must become real production assets, not only text prompts.

16. Store-ready polish is required: animations, sounds, texts, onboarding, first-user experience, transitions, and reward feedback.

17. Content-level protection is required. Tests must verify not only technical validity but also beautiful, understandable, noun-only, non-repetitive words.

18. Hindi, Chinese, Japanese, and Korean require special validation for writing systems, segmentation, words, and crossword behavior.

19. Location progress must be synchronized with completed levels.

20. Monetization will be implemented at production quality: ads, rewarded ads, in-app purchases, shop logic, and economy balance.

21. Final Play Market release must pass full audit: strict build, tests, level verification, mobile QA, content validation, localization, policies, privacy, screenshots, icons, store listing, and Android package validation.

22. Every language must have exactly 300 levels split into 15 blocks of 20 levels. Each block repeats the same difficulty law from easy to hard.

## Fixed 20-Level Block Law

This pattern applies to every block and every language:

```text
1  = 4 letters / 2 main words
2  = 4 letters / 3 main words
3  = 5 letters / 4 main words
4  = 5 letters / 5 main words
5  = 5 letters / 6 main words
6  = 5 letters / 7 main words
7  = 6 letters / 8 main words
8  = 6 letters / 8 main words
9  = 6 letters / 9 main words
10 = 6 letters / 9 main words
11 = 7 letters / 10 main words
12 = 7 letters / 10 main words
13 = 7 letters / 11 main words
14 = 7 letters / 12 main words
15 = 8 letters / 13 main words
16 = 8 letters / 14 main words
17 = 8 letters / 14 main words
18 = 9 letters / 14 main words
19 = 9 letters / 16 main words
20 = 10 letters / 17 main words
```

Blocks:

```text
1-20, 21-40, 41-60, 61-80, 81-100,
101-120, 121-140, 141-160, 161-180, 181-200,
201-220, 221-240, 241-260, 261-280, 281-300
```

Examples:

```text
Level 1   = 4 letters / 2 words
Level 20  = 10 letters / 17 words
Level 21  = 4 letters / 2 words
Level 40  = 10 letters / 17 words
Level 41  = 4 letters / 2 words
Level 60  = 10 letters / 17 words
Level 281 = 4 letters / 2 words
Level 300 = 10 letters / 17 words
```

## Absolute Word Rule

All main words and bonus words in all languages must be nouns only.

Forbidden: verbs, adjectives, adverbs, pronouns, particles, prepositions, conjunctions, abbreviations, fake words, random fragments, offensive words, duplicate words, and words native speakers would reject.

## Supported Languages

English, Spanish, Russian, Turkish, German, Portuguese, Italian, French, Azerbaijani, Hindi, Chinese, Japanese, Korean.
