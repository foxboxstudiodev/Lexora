# Lexora Expansion Roadmap

Fixed target for the next Lexora build.

## Languages

Current:
- English
- Spanish
- Russian
- Turkish

Add:
- German
- Portuguese
- Italian
- French
- Azerbaijani
- Hindi
- Chinese
- Japanese
- Korean

Total: 13 languages.

## Levels

- 300 levels per language.
- 3,900 total levels.
- Difficulty must grow gradually.

## Mobile word selection

Required behavior:
- press first letter;
- slide finger through letters;
- selected letters light up;
- connection line follows selected letters;
- release finger;
- valid word fills the crossword;
- invalid word clears immediately.

## Letter wheel

- Circular layout.
- Minimum 5 letters.
- Letter count varies by level.
- Wheel should support comfortable swiping.
- Main word must rarely equal the displayed wheel order.
- Target: no more than about 1 ordered main word per 100 levels.

## Crossword grid

- Horizontal and vertical words.
- No diagonal words.
- Words must intersect through shared letters.
- Shared letters should create new word branches.
- Grid must look like a real connected crossword.

## Backgrounds

- Each level should have a cartoon travel background.
- Backgrounds should represent real countries, landmarks, cities, nature or culture.
- Examples: Egypt, France, Japan, mountains, beaches, temples, gardens.
- Full version should avoid repeated backgrounds.

## Exploration screen

Add country/location exploration:
- country cards;
- location cards;
- completed checkmarks;
- locked future locations;
- chapter progression.

## Language notes

- Azerbaijani: support ə, ı, ö, ü, ç, ş, ğ.
- Hindi: Devanagari support.
- Chinese: short character words.
- Japanese: start with hiragana and katakana.
- Korean: Hangul syllable blocks.

## Build order

1. Stabilize swipe selection.
2. Add visible connection line.
3. Add new languages to registry.
4. Upgrade level data model.
5. Add wheel-order validation.
6. Add crossword intersection generator.
7. Add background/location registry.
8. Add exploration screen.
9. Generate validated 300-level packs.

## Russian summary

Нужно добавить немецкий, португальский, итальянский, французский, азербайджанский, хинди, китайский, японский и корейский.

На каждый язык нужно 300 уровней. Всего цель: 3900 уровней.

Управление должно быть свайпом: зажал букву, провел по буквам, отпустил. Верное слово засчитывается. Неверное сразу сбрасывается.

Буквы должны стоять по кругу. Минимум 5 букв. Количество букв меняется от уровня к уровню.

Главное слово не должно часто совпадать с порядком букв в круге. Цель: не чаще примерно 1 раза на 100 уровней.

Кроссворд должен быть настоящим: слова горизонтально и вертикально, пересечения через общие буквы, новые ветки от пересечений.

Фоны должны быть мультяшными travel-сценами по реальным странам и местам. Нужен экран исследования стран и локаций.
