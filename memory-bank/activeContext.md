# Active Context — kids-games

## Current Focus
iOS speech synthesis fix — `speechSynthesis` is available on iOS but was silently failing due to code antipatterns.

## What Was Built Recently
- **iOS speech fix**: `js/speech.js` simplified — removed `cancel()` before `speak()` (iOS WebKit bug drops the speak), removed `findFemaleVoice()` / `ensureVoice()` / `preferredVoice` (voice selection), removed `primeSpeech()` body (empty utterance primes iOS into a bad state). New `speak()` mirrors the working test pattern: create utterance, set lang/rate/pitch/volume, call `speak()` directly. `primeSpeech()` kept as no-op stub for import compatibility.
- **6 game files cleaned**: Removed `primeSpeech` import and call from animal-soundboard, buah-sayur, kendaraan, bangunan, benda, and suku-kata.

## Architecture Updates
- `speech.js` is now a thin wrapper — no state, no listeners, no cancel.
- All games call `speak()` directly on tap — no priming step needed.

## Known Issues
- None

## Next Up
- Game #3: Peek-a-Boo Bus (Bis Cilukba!) — family vocabulary reveal
- Game #4: Color Splash (Warna-Warni) — color names bilingual
- Service worker for full offline caching
