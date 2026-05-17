# Lexora Fast Deploy Checklist

## Build commands

```bash
npm install
npm run build
npm test
```

## Expected runtime content

```text
Languages: 13
Levels per language: 300
Total playable levels: 3900
Wheel units: 5-10
```

## Vercel settings

```text
Framework: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```

## Main screens

```text
Main Menu
Languages
Level Map
Game
Complete
Explore
Daily Reward
Achievements
Settings
```

## Critical checks

```text
1. Main menu opens.
2. Languages button opens language list.
3. All 13 languages are visible.
4. Selecting a language changes active pack.
5. Every language has 300 levels.
6. A level starts without crashing.
7. Swipe selection works on mobile.
8. Wrong word clears after release.
9. Correct word fills crossword.
10. Build passes on Vercel.
```
