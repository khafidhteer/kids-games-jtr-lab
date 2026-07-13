# Kids Games — kids-games.jtr-lab.com

A collection of lightweight browser games for children aged 2–6. Designed for touch-first play on tablets and phones, with bilingual support (English / Bahasa Indonesia).

**Live:** https://kids-games.jtr-lab.com

## Games

| # | Game | Concept |
|---|------|---------|
| 1 | [Magic Canvas](games/magic-canvas/) | Cause & Effect — tap to spawn colorful floating shapes |
| 2 | [Animal Soundboard](games/animal-soundboard/) | Bilingual animal names with real animal sounds (EN/ID) |

## Tech

- Vanilla JS (ES modules) — no frameworks, no build tools
- HTML5 Canvas, CSS Grid, SVG
- Web Audio API for synthesized effects
- [Mixkit](https://mixkit.co/free-sound-effects/animals/) open-source MP3s for animal sounds
- Web Speech API for bilingual voiceover
- Static files on nginx, SSL via Let's Encrypt

## Project Structure

```
kids-games/
├── index.html                  # Game hub
├── css/style.css               # Shared styles
├── js/
│   ├── shared.js               # Shapes, colors, utilities
│   ├── audio.js                # Synth sounds + MP3 playback
│   ├── speech.js               # Web Speech API wrapper
│   ├── animals.js              # Bilingual animal data (18 animals)
│   ├── languages.js            # Bilingual family/color data
│   └── safeguard.js            # Anti-zoom, anti-close for toddlers
├── assets/
│   ├── audio/animals/          # MP3 animal sounds (mixkit)
│   └── svg/icons.svg           # UI icon sprite
├── games/
│   ├── magic-canvas/           # Game 1
│   └── animal-soundboard/      # Game 2
└── memory-bank/                # Project memory bank
```

## Adding a New Game

1. Create `games/<game-name>/` with `index.html`, `style.css`, `game.js`
2. Import shared modules via ES modules
3. Include the safeguard module in HTML
4. Add a card to the root `index.html` hub

## License

[MIT](LICENSE) — Animal sounds from [Mixkit](https://mixkit.co/free-sound-effects/animals/) (free license).
