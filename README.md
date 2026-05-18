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

## Implemented

- React/Vite game shell
- dedicated Languages screen
- 13 playable language packs
- 3900 generated runtime levels
- exact 4-10 wheel progression per 20-level block
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
