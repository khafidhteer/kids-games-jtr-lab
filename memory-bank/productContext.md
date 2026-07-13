# Product Context — kids-games

## Target Users

### Primary: Toddlers (ages 2–6)
- Limited fine motor skills → large touch targets (min 48px)
- Short attention spans → instant feedback, no waiting
- No reading ability → zero text instructions, pure visual/auditory UX
- Easily frustrated → no lose states, no wrong answers
- Unintentional gestures → anti-zoom, anti-close safeguards

### Secondary: Parents/caregivers
- Want safe, ad-free screen time
- Appreciate educational value (cause-effect, vocabulary, colors, animals)
- Need offline capability (car rides, flights)
- Bilingual households → EN/ID language toggle

## UX Principles
1. **Instant feedback** — every tap produces immediate visual + audio response
2. **Zero frustration** — no rules, no scores, no game-over screens
3. **Big targets** — entire screen or large cards are interactive
4. **Bright colors** — high-contrast, saturated palette
5. **Real sounds** — actual animal recordings (mixkit), not synthetic tones
6. **Bilingual voiceover** — Web Speech API speaks words in EN or ID
7. **Self-explanatory** — a child should figure it out by tapping once
8. **Toddler-proof** — no accidental zoom, page close, or back navigation
9. **Math-gated settings** — language toggle requires solving a simple addition to prevent accidental switches

## Sound Reliability
- HTML5 `Audio` element used for MP3 playback (not Web Audio API decodeAudioData)
- Fresh `new Audio(url)` per play — maximizes Chrome Android compatibility
- `AudioContext` only used for synthesized sounds (AudioSynth)
- `unlockAudio()` called fire-and-forget on first tap — doesn't block playback

## Language Toggle Behavior
- Math verification modal appears on language switch attempt
- Random addition problem (1+1 through 8+8)
- Must solve correctly to switch language
- Cancel button to dismiss without changing
- Speech confirmation on successful switch ("English" or "Bahasa Indonesia")
