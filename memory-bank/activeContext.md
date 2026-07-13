# Active Context — kids-games

## Current Focus
Completed: Game #2 Animal Soundboard — bugfixed for Chrome Android mobile. Three major fixes applied:
1. Sound: switched from `cloneNode()` to fresh `new Audio()` per play
2. Language toggle: math verification modal prevents toddler accidental switches; uses `pointerdown` instead of `click`
3. Safeguard: skips `preventDefault` on interactive elements (buttons/links)

## What Was Built Recently
- **Audio rewrite**: `js/audio.js` now uses HTML5 `Audio` elements instead of `fetch + decodeAudioData`. Fresh `new Audio(url)` per play — no `cloneNode()`, no caching. `unlockAudio()` is fire-and-forget (not awaited) so it doesn't block the user gesture.
- **Math verification modal**: `games/animal-soundboard/index.html` now includes a modal (`#math-modal`) with a random addition problem (1+1 through 8+8). Must solve correctly to switch language. Cancel button to dismiss.
- **Safeguard fix**: `js/safeguard.js` now skips `preventDefault` on `touchstart` when target is inside `button, a, input, [role="button"]`. This prevents the safeguard from eating click events on language buttons.
- **Universal touch-action**: `css/style.css` — `touch-action: manipulation` added to `*` selector (all elements). `-webkit-text-size-adjust: 100%` added to `html`.
- **Language toggle rewrite**: `games/animal-soundboard/game.js` — language buttons use `pointerdown` (not `click`). Direct `nameEls[]` array references instead of `querySelectorAll`. `unlockAudio()` not awaited before `playAudio()`.
- **Git push**: All changes committed and pushed to `git@github.com:khafidhteer/kids-games-jtr-lab.git` (main branch)

## Architecture Updates
- **MP3 playback**: HTML5 `Audio` element (`new Audio(url).play()`) — simpler, more compatible, no `AudioContext` dependency
- **AudioContext**: Only used for `AudioSynth` (synthesized sounds) and `unlockAudio()` — NOT for MP3 playback
- **Safeguard**: Interactive elements (buttons, links, inputs) are excluded from double-tap zoom prevention
- **Language toggle**: Math-gated — requires solving addition before switching

## Known Issues
- None currently

## Next Up
- Game #3: Peek-a-Boo Bus (Bis Cilukba!) — family vocabulary reveal
- Game #4: Color Splash (Warna-Warni) — color names bilingual
- Service worker for full offline caching
