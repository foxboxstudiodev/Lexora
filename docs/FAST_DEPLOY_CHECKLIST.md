# Lexora Fast Deploy Checklist

## Build commands

```bash
npm install
npm run build:vercel
npm run verify:levels
```

## Expected runtime content

```text
Languages: 13
Levels per language: 300
Total playable levels: 3900
Difficulty blocks: 15 x 20 levels per language
Wheel units: exact 4-10 repeating inside every 20-level block
```

## Exact wheel progression per 20-level block

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

## Vercel settings

```text
Framework: Vite
Install command: npm install
Build command: npm run build:vercel
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
7. Wheel background allows vertical page scroll.
8. Letter buttons start swipe selection.
9. Wrong word clears after release.
10. Correct word fills crossword.
11. Every main word can be built from the wheel.
12. Crossword has clean real intersections, not cramped word collisions.
13. Build passes on Vercel.
14. npm run verify:levels passes locally.
```
