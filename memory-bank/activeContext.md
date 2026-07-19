# Active Context — kids-games

## Current Focus
iOS speech synthesis — fixed and confirmed working. Root cause was twofold: `pointerdown` + `e.preventDefault()` prevented the `click` event iOS SpeechSynthesis requires for user activation, and `speak()` was called after audio APIs (AudioSynth/playAudio) which grabbed the audio session first.

## What Was Built Recently
- **speech.js cleanup**: Removed `cancel()` (iOS WebKit bug drops speak), voice selection (voices async on iOS), `primeSpeech()` body (empty utterance primes iOS into bad state). Module is now a thin wrapper.
- **Card handler rewrite**: Changed from `pointerdown` + `e.preventDefault()` to `click` (no preventDefault). `click` is the universally trusted gesture event on iOS.
- **Call order swap**: `speak()` now runs BEFORE `playAudio()`/`AudioSynth` to grab the iOS audio session first.
- **6 game files updated**: animal-soundboard, buah-sayur, kendaraan, bangunan, benda, suku-kata.
- **Cache bust**: Bumped version to `20260719140000` in all HTML files + version.js.

## Known Issues
- None

## Next Up
- Game #3: Peek-a-Boo Bus (Bis Cilukba!) — family vocabulary reveal
- Game #4: Color Splash (Warna-Warni) — color names bilingual
- Service worker for full offline caching
