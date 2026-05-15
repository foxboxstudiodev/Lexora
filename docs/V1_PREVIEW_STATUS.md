# Lexora v1-preview Status

## Preview target

Lexora v1-preview is a playable, installable, multilingual word-connect crossword game.

## Content scope

- English: 10 levels
- Spanish: 10 levels
- Russian: 10 levels
- Turkish: 10 levels
- Total: 40 generated starter levels

## Core gameplay

- Letter wheel selection
- Touch and pointer support
- Connection line between selected letters
- Crossword grid rendering
- Main word validation
- Bonus word validation
- Duplicate-word protection
- Level completion flow
- Next level flow
- Level map flow

## Progression

- Per-language progress
- Coins
- Hints
- Bonus-word rewards
- Daily reward
- Achievements
- Player statistics
- World/chapter map sections

## UX and polish

- Themed worlds
- Gameplay world ribbon
- Glow feedback
- Haptic feedback
- Lightweight Web Audio feedback
- Mobile safe-area support
- Reduced-motion support
- Focus-visible accessibility styling
- Screen-reader labels on key gameplay and level-map controls

## PWA readiness

- Web app manifest
- SVG app icon
- Service worker
- Install prompt integration
- GitHub Pages base path configured

## Quality gate

Use one command:

```bash
npm run verify
```

This runs:

```bash
npm test && npm run build
```

## Remaining external verification

The code-side v1-preview is ready for verification. Final 100% preview status requires:

- GitHub Actions CI green
- GitHub Pages deployment green
- Live URL visual smoke test
