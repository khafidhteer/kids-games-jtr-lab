# Active Context — kids-games

## Current Focus
Completed: Game #2 Animal Soundboard (upgraded with real mixkit MP3 sounds + 18 animals). All safeguards applied.

## What Was Built Recently
- **Real animal sounds**: 10 MP3 files from mixkit.co downloaded to `assets/audio/animals/`
- **Shared animals module**: `js/animals.js` — 18 animals with randomized selection, bilingual data
- **Audio playback**: `js/audio.js` extended with `playAudio(url)` — fetches, decodes, caches MP3 via Web Audio API
- **AudioContext unlock**: `unlockAudio()` added to fix silent audio on mobile first-tap
- **Speech safety**: `js/speech.js` wrapped in try/catch with 100ms delay to avoid AudioContext conflict
- **Anti-zoom/close safeguards**: `js/safeguard.js` module — prevents gesture zoom, double-tap zoom, page close, back navigation
- **CSS hardening**: `touch-action: manipulation`, `overscroll-behavior: none` added to shared CSS

## Architecture Updates
- Animal sounds are now real MP3s, not synthesized oscillators
- Animal data is shared via `js/animals.js` (reusable across games)
- `js/languages.js` still holds family/color data for other games
- `js/audio.js` now has both `AudioSynth` (synthesized) AND `playAudio()` (MP3 playback)

## Next Up
- Game #3: Peek-a-Boo Bus (Bis Cilukba!) — family vocabulary reveal
- Game #4: Color Splash (Warna-Warni) — color names bilingual
