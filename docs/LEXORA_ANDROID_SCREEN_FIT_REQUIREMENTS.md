# Lexora Android Screen Fit Requirements

Status: ACTIVE.

This document extends `docs/LEXORA_MASTER_PLAN.md` and makes the Android screen-fit requirement explicit.

## Absolute rule

The Lexora game screen and all core application screens must adapt to every Android smartphone screen size.

The player must not need to scroll vertically, scroll horizontally, zoom, rotate the phone, or search for hidden UI elements to play the game or use core screens.

## Required behavior

1. The gameplay screen must fit inside one visible Android viewport.
2. Crossword grid, word preview, letter wheel, top bar, coins, level number, hint button, shuffle button, clear button, status row, and completion feedback must remain visible and usable.
3. The layout must adapt to tall screens, short screens, narrow screens, wide screens, notched displays, and safe-area insets.
4. The game must not be designed only for one phone model.
5. Samsung A56, Xiaomi Redmi Note 9S, and comparable Android phones must each receive a layout that feels native to that screen size.
6. The screen must not contain large empty zones while also hiding gameplay controls elsewhere.
7. No required gameplay control may be below the fold.
8. No required gameplay control may be cut off at the side of the screen.
9. Touch targets must remain usable on small Android screens.
10. Letter wheel size, crossword cell size, font size, padding, and spacing must scale dynamically.

## Implementation expectation

The project must use responsive CSS with viewport units, safe-area support, flexible grid sizing, clamped font sizes, and compact fallbacks for small or short screens.

The final release must be tested on multiple Android screen profiles, including at least:

- modern tall Samsung-style screens;
- Xiaomi/Redmi mid-size screens;
- smaller budget Android screens;
- short-height browser/PWA viewports;
- Android devices with gesture/navigation bars.

## Release gate

A release is not acceptable if the player must scroll to find gameplay controls, if the crossword or wheel is cut off, or if the UI only works correctly on one specific Android phone.
