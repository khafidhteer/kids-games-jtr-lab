# Project Brief — kids-games

## Overview
A collection of up to 20 lightweight browser games designed for children aged 2–6, hosted at **kids-games.jtr-lab.com**. All games must work offline and require zero build tools. Bilingual support (English / Bahasa Indonesia) for language learning games.

## Goals
- 20 games maximum, each self-contained in `/games/<game-name>/`
- Pure JS, HTML5, CSS — no heavy frameworks or engines
- Graphics via SVG, HTML5 Canvas, or CSS animations
- Audio: mixkit.co open-source MP3s for real sounds (animals), Web Audio API for synthesized effects (UI pops, boings)
- Web Speech API for voiceover (bilingual spoken words)
- Full offline support after first load
- Shared assets in `/js/`, `/assets/audio/`, `/assets/svg/`
- Games use ES modules (`type="module"`) to import shared code
- Anti-zoom, anti-close safeguards for toddler-proof usage

## Constraints
- Target: modern browsers (Chrome, Safari, Firefox, Edge)
- Touch-first: must work on tablets and phones
- No login, no ads, no tracking
- Each game must be playable with zero instructions
- Kid-safe: no external links, no form inputs

## Tech Stack
- Vanilla JS (ES modules)
- HTML5 Canvas for drawing games
- CSS Grid/Flexbox for DOM-based games
- SVG for UI elements and decorations
- Web Audio API for synthesized sound effects
- Web Speech API for voiceover (EN/ID)
- Mixkit open-source MP3s for real animal sounds
- CSS3 for layout, transitions, and animations
- Nginx static file hosting on VPS

## Deployment
- VPS: Ubuntu 24.04, nginx 1.24, SSL via Let's Encrypt
- Domain: kids-games.jtr-lab.com (A record → 43.129.54.230)
- Static files served from `/home/ubuntu/kids-games/`
- Auto-renewal via certbot scheduled task
