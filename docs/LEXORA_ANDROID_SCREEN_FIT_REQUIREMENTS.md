# Lexora Mobile Screen Fit Requirements

Status: ACTIVE.

This document extends `docs/LEXORA_MASTER_PLAN.md` and makes the mobile screen-fit requirement explicit for Android and iPhone.

## Absolute rule

The Lexora game screen and all core application screens must adapt to every mobile smartphone screen size, including Android phones and iPhones.

The player must not need to scroll vertically, scroll horizontally, zoom, rotate the phone, or search for hidden UI elements to play the game or use core screens.

## Required behavior

1. The gameplay screen must fit inside one visible mobile viewport.
2. Crossword grid, word preview, letter wheel, top bar, coins, level number, hint button, shuffle button, clear button, status row, and completion feedback must remain visible and usable.
3. The layout must adapt to tall screens, short screens, narrow screens, wide screens, notched displays, Dynamic Island / notch areas, home indicator areas, gesture navigation bars, and safe-area insets.
4. The game must not be designed only for one phone model, one Android device, or one iPhone generation.
5. Samsung A56, Xiaomi Redmi Note 9S, iPhone 14, iPhone 17, and comparable mobile phones must each receive a layout that feels native to that screen size.
6. The screen must not contain large empty zones while also hiding gameplay controls elsewhere.
7. No required gameplay control may be below the fold.
8. No required gameplay control may be cut off at the side, top, or bottom of the screen.
9. Touch targets must remain usable on small Android and iPhone screens.
10. Letter wheel size, crossword cell size, font size, padding, and spacing must scale dynamically.

## Implementation expectation

The project must use responsive CSS with viewport units, dynamic viewport units, safe-area support, flexible grid sizing, clamped font sizes, and compact fallbacks for small, narrow, or short screens.

The final release must be tested on multiple mobile screen profiles, including at least:

- modern tall Samsung-style Android screens;
- Xiaomi/Redmi mid-size Android screens;
- smaller budget Android screens;
- iPhone standard screens;
- iPhone Pro / Pro Max screens;
- iPhones with notch or Dynamic Island;
- short-height browser/PWA viewports;
- Android devices with gesture/navigation bars;
- iOS Safari / iOS PWA viewport behavior.

## Release gate

A release is not acceptable if the player must scroll to find gameplay controls, if the crossword or wheel is cut off, if required UI is hidden behind mobile safe areas, or if the UI only works correctly on one specific Android phone or one specific iPhone.
