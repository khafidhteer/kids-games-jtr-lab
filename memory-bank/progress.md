# Progress — kids-games

## Game Tracker

| # | Game | Concept | Status |
|---|------|---------|--------|
| 1 | Magic Canvas | Cause & Effect — tap to spawn shapes | ✅ Done |
| 2 | Animal Soundboard | Bilingual animal names + real sounds (EN/ID) | ✅ Done (bugfixed) |
| 3 | Peek-a-Boo Bus | Family vocabulary reveal game | 🔨 Next |
| 4 | Color Splash | Color names bilingual (EN/ID) | ⏳ Pending |
| 5–20 | TBD | — | ⏳ Pending |

## Infrastructure

| Item | Status |
|------|--------|
| Project structure | ✅ Done |
| Memory bank | ✅ Done |
| Shared CSS (zoom/click prevention) | ✅ Done |
| Shared JS (shapes, utils) | ✅ Done |
| Shared Audio module (synth + MP3 playback) | ✅ Done (HTML5 Audio) |
| Shared Speech module (Web Speech API) | ✅ Done |
| Shared Animals data (18 animals, 10 MP3s) | ✅ Done |
| Shared Languages data (family, colors) | ✅ Done |
| Safeguard module (anti-zoom, anti-close) | ✅ Done (Chrome Android fixed) |
| SVG icon sprites | ✅ Done |
| Animal MP3s (mixkit.co) | ✅ Done (10 files) |
| Game hub (index.html) | ✅ Done |
| README + MIT LICENSE | ✅ Done |
| Git repo + GitHub push | ✅ Done |
| Service worker (offline) | ⏳ Pending |
| SSL/HTTPS deployment | ✅ Done (Let's Encrypt) |
| DNS (kids-games.jtr-lab.com) | ✅ Done |

## Audio Files Downloaded (mixkit.co, free license)

| File | Animal | Source |
|------|--------|--------|
| cat.mp3 | Cat | mixkit.co/sfx/93 |
| dog.mp3 | Dog | mixkit.co/sfx/1 |
| cow.mp3 | Cow | mixkit.co/sfx/1751 |
| chicken.mp3 | Chicken/Duck | mixkit.co/sfx/2462 |
| horse.mp3 | Horse/Elephant | mixkit.co/sfx/85 |
| pig.mp3 | Pig | mixkit.co/sfx/3 |
| monkey.mp3 | Monkey | mixkit.co/sfx/108 |
| lion.mp3 | Lion/Bear | mixkit.co/sfx/6 |
| wolf.mp3 | Wolf | mixkit.co/sfx/2485 |
| bird.mp3 | Bird/Frog/Owl | mixkit.co/sfx/17 |

## Git Commits

| Hash | Message |
|------|---------|
| `8a9b02b` | feat: kids-games v1 — Magic Canvas + Animal Soundboard |
| `f3520cf` | docs: add README and MIT license |
| `8748e28` | fix: HTML5 audio, Safari double-tap zoom, language toggle speech |
| `70b395b` | fix: fresh Audio per play, math verification for lang toggle, safeguard skip interactive elements |
