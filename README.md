# Lexora

Lexora is an original multilingual word-connect crossword puzzle game built with React, TypeScript and Vite.

## Version

`0.1.0-preview`

## Current status

```text
Vercel deploy: green
Production URL: https://lexora.vercel.app/
Languages: 13
Levels per language: 300
Total runtime levels: 3900
Rollback redeploy marker: 2026-05-18
```

## Playable languages

```text
English
Spanish
Russian
Turkish
German
Portuguese
Italian
French
Azerbaijani
Hindi
Chinese
Japanese
Korean
```

## Level progression law

Every language has 300 levels split into 15 repeated blocks of 20 levels.

Inside every 20-level block, selectable wheel units follow this exact pattern:

```text
1  -> 4
2  -> 4
3  -> 5
4  -> 5
5  -> 5
6  -> 5
7  -> 6
8  -> 6
9  -> 6
10 -> 6
11 -> 7
12 -> 7
13 -> 7
14 -> 7
15 -> 8
16 -> 8
17 -> 8
18 -> 9
19 -> 9
20 -> 10
```

The pattern restarts every 20 levels:

```text
21 -> 4
40 -> 10
41 -> 4
60 -> 10
281 -> 4
300 -> 10
```

## Curated vocabulary law

Lexora must not behave like a random letter or word generator. Every playable language pack must use curated vocabulary.

For every supported language, all main words and bonus words must follow these rules:

```text
- real words only
- nouns only
- no fake words
- no random generated strings
- no abbreviations unless they are universally recognized as normal words in that language
- no obsolete, archaic or extremely rare words
- no offensive or adult words
- no malformed inflections
- no duplicate words inside the same language pack
- no excessive repetition of the same semantic topic across nearby levels
```

Vocabulary must feel natural to native speakers of the target language. English words must feel natural to English speakers, Russian words to Russian speakers, Turkish words to Turkish speakers, Azerbaijani words to Azerbaijani speakers, and so on for every playable language.

Word difficulty must progress together with the 15-block level system:

```text
Block 1  | Levels 1-20    | very common short nouns
Block 2  | Levels 21-40   | common nouns with slightly higher variety
Block 3  | Levels 41-60   | common everyday nouns
Block 4  | Levels 61-80   | medium-easy nouns
Block 5  | Levels 81-100  | medium nouns
Block 6  | Levels 101-120 | medium nouns with broader themes
Block 7  | Levels 121-140 | medium-hard nouns
Block 8  | Levels 141-160 | longer and less obvious nouns
Block 9  | Levels 161-180 | harder nouns with richer letter patterns
Block 10 | Levels 181-200 | advanced but still familiar nouns
Block 11 | Levels 201-220 | advanced nouns
Block 12 | Levels 221-240 | advanced mixed-theme nouns
Block 13 | Levels 241-260 | difficult but fair nouns
Block 14 | Levels 261-280 | difficult, diverse nouns
Block 15 | Levels 281-300 | hardest fair nouns, still real and recognizable
```

The vocabulary system must preserve diversity across themes, including nature, animals, food, objects, technology, science, geography, culture, history, daily life and abstract nouns where appropriate for the language.

## Implemented

- React/Vite game shell
- dedicated Languages screen
- 13 playable language packs
- 3900 generated runtime levels
- exact 4-10 wheel progression per 20-level block
- curated multilingual vocabulary law
- wheel background vertical scroll behavior
- letter-only swipe selection
- crossword generation with real intersections
- anti-kasha runtime quality gates
- main-word and bonus-word buildability checks
- multilingual grid unit support
- multilingual hint unit support
- mouse/touch letter-wheel interaction
- real-time letter connection line
- hints and coin spending
- bonus-word coin rewards
- local progress persistence
- player statistics
- achievements screen
- daily reward system
- settings screen for sound, music and vibration
- haptic feedback
- lightweight Web Audio feedback
- world registry and themed world progression
- world/chapter level map sections
- PWA manifest, app icon, service worker and install prompt
- Vercel root deployment configuration
- focused `verify:levels` quality script

## Run locally

```bash
npm install
npm run dev
```

## Deploy build

```bash
npm run build:vercel
```
