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
- **MP3 playback** via `playAudio(url)` — fetches, decodes with Web Audio API, caches in Map
- **Audio unlock** via `unlockAudio()` — must be called on first user gesture for mobile

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
- Prevents pinch/gesture zoom via event listeners
- Blocks double-tap zoom (300ms detection window)
- `beforeunload` warning on page close
- `history.pushState` + `popstate` blocks back button

## Asset Strategy

### SVG (`assets/svg/`)
- UI icons as `<symbol>` sprite sheet: back, home, sound-on, sound-off
- Referenced via `<use href="...#icon-name">`

### Audio
- **Real sounds**: MP3 files in `assets/audio/animals/` from mixkit.co (free license)
- **Synthesized effects**: Web Audio API oscillators in `js/audio.js`
- Audio is cached in a Map after first fetch for instant replay

### CSS
- `css/style.css` — shared base (hub, game header, responsive breakpoints)
- `touch-action: manipulation` prevents browser zoom gestures
- `overscroll-behavior: none` prevents pull-to-refresh

## Naming Conventions
- Game folders: lowercase kebab-case (`magic-canvas`, `animal-soundboard`)
- JS files: camelCase for modules, kebab-case for pages
- CSS classes: BEM-style (`animal-card__emoji`, `game-header__btn`)
- SVG symbols: `icon-` prefix
