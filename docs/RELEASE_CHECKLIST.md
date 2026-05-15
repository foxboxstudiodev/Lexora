# Lexora Release Checklist

## v1-preview content target

- [x] 4 supported languages
- [x] 10 starter preview levels per language
- [x] 40 generated levels total
- [x] Curated seed-based level generation
- [x] Level integrity tests locked to 10 levels per language

## Core gameplay

- [x] Letter selection
- [x] Word validation
- [x] Bonus words
- [x] Hints
- [x] Coin spending
- [x] Coin rewards
- [x] Level completion
- [x] Level map

## Progression

- [x] Per-language progress
- [x] Daily reward
- [x] Achievements
- [x] Player statistics
- [x] World registry
- [x] Chapter/world map sections
- [ ] Full world unlock pacing
- [ ] Expanded full-v1 level count

## UX polish

- [x] Glow feedback
- [x] Haptic feedback
- [x] Audio feedback
- [x] Themed worlds
- [x] Gameplay world ribbon
- [ ] Final mobile spacing pass
- [ ] Final accessibility pass
- [ ] Final animation timing pass

## Technical quality

- [x] TypeScript
- [x] CI workflow
- [x] Deploy workflow
- [x] Level integrity tests
- [x] Economy tests
- [x] Daily reward tests
- [x] Word engine tests
- [x] World registry tests
- [x] PWA manifest
- [x] Service worker
- [x] Error boundary
- [x] Safe localStorage handling
- [ ] Full CI green verification
- [ ] GitHub Pages live verification

## Release commands

```bash
npm install
npm test
npm run build
```
