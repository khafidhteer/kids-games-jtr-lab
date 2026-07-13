# System Patterns — kids-games

## Architecture
Each game is a self-contained folder under `/games/<game-name>/` with:
- `index.html` — loads shared CSS + shared JS via `<script type="module">`
- `style.css` — game-specific styles (layout, animations)
- `game.js` — game logic, imports from shared modules

The root `index.html` serves as a game hub linking to all games.

All game HTML files include the safeguard module:
```html
<script type="module">
  import { initSafeguards } from '../../js/safeguard.js';
  initSafeguards();
</script>
```

## Shared Modules (ES Modules)

### `js/shared.js`
Exports reusable utilities:
- `COLORS` — kid-friendly color palette (20 colors)
- `Shapes` — drawing functions: circle, star, heart, blob, diamond, triangle
- `randomColor()`, `randomShape()`, `randomBetween(min, max)`, `randomInt(min, max)`
- `navigateTo(path)` — relative path navigation

### `js/audio.js`
Dual-mode audio system:
- **Synthesized sounds** via `AudioSynth` object: pop, boing, ding, whoosh, chime, squeak + animal synth sounds (meow, woof, moo, quack, cluck, baa)
- **MP3 playback** via `playAudio(url)` — creates `new Audio(url)`, calls `.play()`. Fresh Audio per play (no cloneNode, no caching). Error logged to console.
- **Audio unlock** via `unlockAudio()` — must be called on first user gesture for mobile. NOT awaited in game code (fire-and-forget) so it doesn't block the user gesture.

### `js/speech.js`
Web Speech API wrapper:
- `speak(text, lang)` — speaks text in en-US or id-ID
- Rate 0.85, pitch 1.1 (toddler-friendly)
- 100ms delay + try/catch to avoid AudioContext conflicts

### `js/animals.js`
Shared animal data (reusable across games):
- 18 animals with `{ en, id, emoji, sound }` — 10 unique MP3 files mapped across 18 species
- `getRandomAnimals(count)` — returns shuffled random subset
- `shuffleArray()` — Fisher-Yates shuffle
- `getAnimalSoundUrl(filename)` — returns full path to MP3

### `js/languages.js`
Bilingual data for non-animal games:
- `family` — Mom/Dad/Baby/Grandma in EN/ID
- `colors` — Red/Blue/Yellow/Green/Purple/Orange in EN/ID

### `js/safeguard.js`
Toddler-proofing module:
- Prevents pinch/gesture zoom via `gesturestart/change/end` listeners
- Blocks double-tap zoom via `touchstart` listener (400ms window) — **skips interactive elements** (`button, a, input, [role="button"]`) so button clicks work
- `dblclick` event prevention as fallback
- `beforeunload` warning on page close
- `history.pushState` + `popstate` blocks back button

## Math Verification Pattern
Language toggle requires solving a random addition problem (1+1 through 8+8):
- Modal overlay with input field + OK/Cancel buttons
- Uses `pointerdown` (not `click`) for button events
- Only applies language change if answer matches
- Pattern can be reused for any settings that shouldn't change accidentally

## Asset Strategy

### SVG (`assets/svg/`)
- UI icons as `<symbol>` sprite sheet: back, home, sound-on, sound-off
- Referenced via `<use href="...#icon-name">`

### Audio
- **Real sounds**: MP3 files in `assets/audio/animals/` from mixkit.co (free license)
- **Synthesized effects**: Web Audio API oscillators in `js/audio.js`
- MP3s played via HTML5 `Audio` element (not Web Audio API decodeAudioData)

### CSS
- `css/style.css` — shared base (hub, game header, responsive breakpoints)
- `touch-action: manipulation` on `*` (universal selector) prevents browser zoom on ALL elements
- `-webkit-text-size-adjust: 100%` on `html` prevents text size inflation on Chrome Android
- `overscroll-behavior: none` prevents pull-to-refresh

## Naming Conventions
- Game folders: lowercase kebab-case (`magic-canvas`, `animal-soundboard`)
- JS files: camelCase for modules, kebab-case for pages
- CSS classes: BEM-style (`animal-card__emoji`, `game-header__btn`)
- SVG symbols: `icon-` prefix
