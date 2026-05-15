# Lexora

Lexora is an original multilingual word-connect crossword puzzle game built with React, TypeScript and Vite.

## v1-preview status

The current preview build contains:

- 4 languages: English, Spanish, Russian and Turkish
- 10 starter preview levels per language
- 40 generated levels total
- crossword grid rendering
- letter-wheel interaction with mouse/touch support
- real-time letter connection line
- main-word and bonus-word validation
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
- PWA manifest, app icon and service worker
- error boundary and safe localStorage handling
- CI tests for levels, economy, daily rewards, word engine and worlds

## Run locally

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Quality gate

Before release:

```bash
npm install
npm test
npm run build
```

## Project direction

Lexora is not a clone of any branded game. It uses the common word-connect crossword mechanic with original name, code, visuals, levels, dictionaries and progression.

Next full v1 target:

- more curated levels per language
- final mobile spacing pass
- final accessibility pass
- final animation timing pass
- full CI green verification
- GitHub Pages live verification
- future Android packaging through Capacitor
