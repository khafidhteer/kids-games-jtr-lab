import { LETTERS } from './letters.js';
import { PRAISE, LETTER_NAMES } from './praise.js';
import { LETTER_WORDS } from './words.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';
import { initSafeguards } from '../../js/safeguard.js';

initSafeguards();

const STORAGE_KEY = 'menulis_huruf_settings';
const PROGRESS_KEY = 'menulis_huruf_progress';

// --- Geometry / layout constants -------------------------------------------
const HEADER_H = 64;
const BOTTOM_BAND = 130;
const SIDE = 24;
const TOLERANCE_PX = 42;
const PALM_SIZE = 60;
const SAMPLE_STEP = 4;
const TUBE_W = 34;        // trace-brush width (CSS px per unit of scale factor)
const BREAK_TOL_PX = TOLERANCE_PX * 2.6; // straying further than this erases the stroke (gentle)
const STRAY_LIMIT = 10;   // consecutive off-path moves before erasing
const TICK_STEP_PX = 90;  // tracing blip cadence (screen px of progress)

const BACK_URL = '../../index.html';

// --- DOM -------------------------------------------------------------------
const canvas = document.getElementById('trace-canvas');
const ctx = canvas.getContext('2d');
const letterLabel = document.getElementById('letter-label');
const modeIndicator = document.getElementById('mode-indicator');
const prevBtn = document.getElementById('prev-letter');
const nextBtn = document.getElementById('next-letter');
const letterDots = document.getElementById('letter-dots');
const soundToggle = document.getElementById('sound-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsBtn = document.getElementById('settings-btn');
const helpBtn = document.getElementById('help-btn');
const backBtn = document.getElementById('back-btn');
const stickerBtn = document.getElementById('sticker-btn');

const mathModal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');

const settingsPanel = document.getElementById('settings-panel');
const settingsApply = document.getElementById('settings-apply');
const settingsCancel = document.getElementById('settings-cancel');
const picker = document.getElementById('letter-picker');

const stickerModal = document.getElementById('sticker-modal');
const stickerTitle = document.getElementById('sticker-title');
const stickerCount = document.getElementById('sticker-count');
const stickerGrid = document.getElementById('sticker-grid');
const stickerReset = document.getElementById('sticker-reset');
const stickerClose = document.getElementById('sticker-close');

const rewardCard = document.getElementById('reward-card');
const rewardLetter = document.getElementById('reward-letter');
const rewardEmoji = document.getElementById('reward-emoji');
const rewardWord = document.getElementById('reward-word');

const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');

const iosHint = document.getElementById('ios-hint');
const iosHintBtn = document.getElementById('ios-hint-btn');

// --- State -----------------------------------------------------------------
let W = 0;
let H = 0;
let dpr = 1;
let zone = { x: 0, y: 0, w: 0, h: 0 };
let offsetX = 0;
let offsetY = 0;
let scale = 1;

let audioReady = false;
let soundOn = true;
let lang = 'id';
let caseMode = 'both';
let demoOn = true;

let sequence = [];
let letterIndex = 0;
let currentChar = 'A';

let strokes = [];        // sampled strokes: array of arrays of {x,y} (unit space)
let screenStrokes = [];  // same strokes projected to screen space (cached)
let strokeComplete = []; // per stroke
let head = [];           // head sample index per stroke
let currentStroke = 0;
let celebrating = false;
let celebrationDone = false;

// Static "balloon letter" glyph layer + dashed centre guide lines
let guideCanvas = null;
let gctx = null;

// Confetti + sparkle particles
let particles = [];
let sparkles = [];

// Tracing stray / audio throttling
let activeOffCount = 0;
let tickAcc = 0;

// Auto-write demo ("watch me write") state
let demo = { active: false, idx: 0, t: 0, pause: 0, tint: [] };
let demoTimerId = null;

// Sticker book state (persisted across sessions)
let completedLetters = [];

const pointers = new Map(); // pointerId -> { x, y, w, h, down }
let activeId = null;
let lastTap = 0;

// --- Settings --------------------------------------------------------------
function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { case: 'both', sound: true, lang: 'id', demo: true };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ case: caseMode, sound: soundOn, lang, demo: demoOn }));
}

// --- Sticker / progress ----------------------------------------------------
function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveProgress(list) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(list));
}

function markLetterComplete(ch) {
  if (!completedLetters.includes(ch)) {
    completedLetters.push(ch);
    saveProgress(completedLetters);
  }
}

function renderStickerGrid() {
  stickerGrid.innerHTML = '';
  for (const ch of sequence) {
    const el = document.createElement('div');
    el.className = 'sticker-tile' + (completedLetters.includes(ch) ? ' done' : '');
    el.textContent = ch;
    stickerGrid.appendChild(el);
  }
}

function updateStickerView() {
  const total = sequence.length;
  const n = sequence.filter((ch) => completedLetters.includes(ch)).length;
  stickerCount.textContent = `⭐ ${n} / ${total}`;
  renderStickerGrid();
}

function showStickerBook() {
  stickerTitle.textContent = lang === 'id' ? 'Stiker Saya' : 'My Stickers';
  stickerReset.textContent = lang === 'id' ? 'Hapus' : 'Reset';
  stickerClose.textContent = lang === 'id' ? 'Tutup' : 'Close';
  updateStickerView();
  stickerModal.classList.add('visible');
}

function hideStickerBook() {
  stickerModal.classList.remove('visible');
}

// --- Sequence --------------------------------------------------------------
function buildSequence() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const lower = 'abcdefghijklmnopqrstuvwxyz'.split('');
  if (caseMode === 'upper') sequence = upper;
  else if (caseMode === 'lower') sequence = lower;
  else sequence = [...upper, ...lower];
}

function updateDots() {
  letterDots.textContent = `${letterIndex + 1} / ${sequence.length}`;
  letterDots.style.cssText = 'font-size:0.85rem;opacity:0.6;font-family:"Segoe UI",sans-serif;pointer-events:none;white-space:nowrap;min-width:44px;text-align:center';
}

function setLetter(i) {
  letterIndex = ((i % sequence.length) + sequence.length) % sequence.length;
  currentChar = sequence[letterIndex];
  updateDots();
  resetLetter();
}

function resetLetter() {
  const raw = LETTERS[currentChar];
  strokes = raw.map((st) => sampleStroke(st));
  strokeComplete = raw.map(() => false);
  head = raw.map(() => 0);
  currentStroke = 0;
  celebrationDone = false;
  sparkles = [];
  activeOffCount = 0;
  tickAcc = 0;
  letterLabel.textContent = currentChar;
  updateModeIndicator();
  computeLayout();
  refreshScreenStrokes();
  buildGuide();
  scheduleDemo();
}

// --- Auto-write demo -------------------------------------------------------
const DEMO_START_DELAY = 800; // ms before the nib starts after a letter loads
const DEMO_GAP = 0.35;        // s pause between strokes
const DEMO_SPEED_UPS = 380;   // unit-space speed of the moving nib

function cancelDemo() {
  clearTimeout(demoTimerId);
  demoTimerId = null;
  demo.active = false;
}

function scheduleDemo() {
  cancelDemo();
  demo.idx = 0;
  demo.t = 0;
  demo.pause = 0;
  demo.tint = strokes.map(() => 0);
  if (!demoOn || celebrating) return;
  demoTimerId = setTimeout(() => {
    demoTimerId = null;
    if (!demoOn || celebrating) return;
    demo.active = true;
    demo.idx = 0;
    demo.t = 0;
    demo.pause = 0;
  }, DEMO_START_DELAY);
}

function strokeUnitLen(i) {
  const st = strokes[i];
  if (!st) return 0;
  let len = 0;
  for (let k = 1; k < st.length; k++) {
    len += Math.hypot(st[k].x - st[k - 1].x, st[k].y - st[k - 1].y);
  }
  return len;
}

function updateDemo(dt) {
  if (!demo.active) return;
  if (celebrating) return;
  if (demo.pause > 0) {
    demo.pause -= dt;
    if (demo.pause <= 0) {
      demo.idx++;
      demo.t = 0;
    }
    return;
  }
  const idx = demo.idx;
  if (idx >= strokes.length) {
    demo.active = false;
    return;
  }
  const st = strokes[idx];
  if (!st || st.length < 2) {
    demo.idx++;
    return;
  }
  const dur = Math.min(2.4, Math.max(0.6, strokeUnitLen(idx) / DEMO_SPEED_UPS));
  demo.t += dt;
  const k = Math.min(1, demo.t / dur);
  demo.tint[idx] = Math.max(demo.tint[idx] || 0, k);
  if (k >= 1) {
    demo.tint[idx] = 1;
    if (idx + 1 >= strokes.length) {
      demo.active = false;
    } else {
      demo.pause = DEMO_GAP;
    }
  }
}

function demoNibPosition() {
  if (!demo.active || demo.idx >= strokes.length) return null;
  if (demo.pause > 0) {
    // holding at the end of the stroke that just finished (idx not advanced yet)
    const cur = screenStrokes[demo.idx];
    if (!cur || cur.length === 0) return null;
    return { x: cur[cur.length - 1].x, y: cur[cur.length - 1].y };
  }
  const st = screenStrokes[demo.idx];
  if (!st || st.length < 2) return null;
  const k = Math.min(1, demo.t / Math.min(2.4, Math.max(0.6, strokeUnitLen(demo.idx) / DEMO_SPEED_UPS)));
  const f = Math.max(0, Math.min(st.length - 1, k * (st.length - 1)));
  const i0 = Math.floor(f);
  const i1 = Math.min(st.length - 1, i0 + 1);
  const t = f - i0;
  return {
    x: st[i0].x + (st[i1].x - st[i0].x) * t,
    y: st[i0].y + (st[i1].y - st[i0].y) * t
  };
}

function updateModeIndicator() {
  const caseLabel = { upper: lang === 'id' ? 'HURUF BESAR' : 'UPPERCASE', lower: lang === 'id' ? 'HURUF KECIL' : 'LOWERCASE', both: lang === 'id' ? 'SEMUA HURUF' : 'ALL LETTERS' }[caseMode];
  modeIndicator.textContent = caseLabel;
}

// --- Sampling (Catmull-Rom interpolation for smooth curves) ----------------
function sampleStroke(points) {
  const out = [];
  if (points.length < 2) return out.map(() => ({ x: 0, y: 0 }));
  if (points.length === 2) {
    // just two points — straight line (Catmull-Rom degenerates, but still works)
    const [ax, ay] = points[0];
    const [bx, by] = points[1];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    const n = Math.max(1, Math.floor(len / SAMPLE_STEP));
    for (let j = 0; j < n; j++) out.push({ x: ax + (dx * j) / n, y: ay + (dy * j) / n });
    out.push({ x: bx, y: by });
    return out;
  }

  // Catmull-Rom interpolation: smooth curve through the original control points
  const cr = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return {
      x: 0.5 * (2*p1[0] + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
      y: 0.5 * (2*p1[1] + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
    };
  };

  const n = points.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const steps = Math.max(1, Math.floor(segLen / SAMPLE_STEP));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push(cr(p0, p1, p2, p3, t));
    }
  }
  out.push({ x: points[n - 1][0], y: points[n - 1][1] });
  return out;
}

// --- Layout ----------------------------------------------------------------
function metric() {
  const s = Math.min(1.6, scale);
  return { s, tube: TUBE_W * s };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!guideCanvas) {
    guideCanvas = document.createElement('canvas');
    gctx = guideCanvas.getContext('2d');
  }
  guideCanvas.width = W * dpr;
  guideCanvas.height = H * dpr;
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  zone = { x: SIDE, y: HEADER_H + 6, w: W - SIDE * 2, h: H - HEADER_H - BOTTOM_BAND - 12 };
  computeLayout();
  refreshScreenStrokes();
  buildGuide();
}

function letterBounds() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const st of LETTERS[currentChar]) {
    for (const [x, y] of st) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

function computeLayout() {
  const b = letterBounds();
  const lw = b.maxX - b.minX || 1;
  const lh = b.maxY - b.minY || 1;
  const pad = Math.min(zone.w, zone.h) * 0.04;
  scale = Math.min((zone.w - pad * 2) / lw, (zone.h - pad * 2) / lh);
  offsetX = zone.x + (zone.w - lw * scale) / 2 - b.minX * scale;
  offsetY = zone.y + (zone.h - lh * scale) / 2 - b.minY * scale;
}

function toScreen(ux, uy) {
  return { x: offsetX + ux * scale, y: offsetY + uy * scale };
}

function toUnit(sx, sy) {
  return { x: (sx - offsetX) / scale, y: (sy - offsetY) / scale };
}

function refreshScreenStrokes() {
  screenStrokes = strokes.map((pts) => pts.map((p) => toScreen(p.x, p.y)));
}

function strokePoly(pen, scr) {
  pen.beginPath();
  pen.moveTo(scr[0].x, scr[0].y);
  for (let i = 1; i < scr.length; i++) pen.lineTo(scr[i].x, scr[i].y);
  pen.stroke();
}

// Build the static ghost "balloon letter" glyph layer.
function buildGuide() {
  if (!guideCanvas) return;
  gctx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  gctx.lineCap = 'round';
  gctx.lineJoin = 'round';
  drawBalloonGlyph();
}

// Ghost "balloon letter" silhouette built straight from the trace strokes, so
// the visible letter IS the traceable path — arrows and dashed guides always
// stay inside the soft translucent body the child snaps their strokes over.
function drawBalloonGlyph() {
  const { s, tube } = metric();
  gctx.lineCap = 'round';
  gctx.lineJoin = 'round';

  // soft translucent body — wide enough to contain arrows, circles & trace lines
  gctx.strokeStyle = 'rgba(255,255,255,0.3)';
  gctx.lineWidth = Math.max(tube * 2.5, 60);
  for (const scr of screenStrokes) {
    if (!scr || scr.length === 0) continue;
    gctx.beginPath();
    gctx.moveTo(scr[0].x, scr[0].y);
    for (let k = 1; k < scr.length; k++) gctx.lineTo(scr[k].x, scr[k].y);
    gctx.stroke();
  }

  // crisp light outline hugging the same paths
  gctx.strokeStyle = 'rgba(255,255,255,0.6)';
  gctx.lineWidth = 3 * s;
  for (const scr of screenStrokes) {
    if (!scr || scr.length === 0) continue;
    gctx.beginPath();
    gctx.moveTo(scr[0].x, scr[0].y);
    for (let k = 1; k < scr.length; k++) gctx.lineTo(scr[k].x, scr[k].y);
    gctx.stroke();
  }
}

// --- Palm rejection input --------------------------------------------------
function inZone(x, y) {
  return x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
}

function contactSize(p) {
  if (p.w > 1 && p.h > 1) return (p.w + p.h) / 2;
  return 0;
}

function isPalm(p) {
  const s = contactSize(p);
  if (s > 0) return s > PALM_SIZE;
  return false;
}

function isFinger(p) {
  return p.down && inZone(p.x, p.y) && !isPalm(p);
}

function recomputeActive() {
  if (activeId !== null && pointers.has(activeId) && isFinger(pointers.get(activeId))) {
    return;
  }
  activeId = null;
  let bestId = null;
  let bestSize = Infinity;
  for (const [id, p] of pointers) {
    if (!isFinger(p)) continue;
    const s = contactSize(p) || 1;
    if (s < bestSize) {
      bestSize = s;
      bestId = id;
    }
  }
  activeId = bestId;
}

function onPointerDown(e) {
  if (celebrating) return;
  cancelDemo();
  if (!audioReady) {
    unlockAudio();
    audioReady = true;
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, w: e.width || 0, h: e.height || 0, down: true });
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (err) {}
  recomputeActive();
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return;
  const p = pointers.get(e.pointerId);
  p.x = e.clientX;
  p.y = e.clientY;
  p.w = e.width || p.w;
  p.h = e.height || p.h;

  if (activeId !== e.pointerId) {
    recomputeActive();
  } else if (!isFinger(p)) {
    // active pointer turned into a palm (grew huge) — reselect
    recomputeActive();
  }
  if (activeId !== e.pointerId || celebrating) return;

  trace(e.clientX, e.clientY);
}

function onPointerUp(e) {
  pointers.delete(e.pointerId);
  if (activeId === e.pointerId) {
    activeId = null;
    activeOffCount = 0;
    recomputeActive();
  }
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);

// --- Tracing / scoring -----------------------------------------------------
function trace(sx, sy) {
  const u = toUnit(sx, sy);
  const tol = TOLERANCE_PX / scale;
  const tol2 = tol * tol;
  const idx = currentStroke;
  const st = strokes[idx];
  if (!st || !screenStrokes[idx]) return;

  // Boundary enforcement: if the in-progress stroke has lost the line, erase it.
  if (head[idx] > 0) {
    const brk = BREAK_TOL_PX / scale;
    const brk2 = brk * brk;
    let d2 = Infinity;
    for (let k = 0; k < st.length; k++) {
      const dx = st[k].x - u.x;
      const dy = st[k].y - u.y;
      const dd = dx * dx + dy * dy;
      if (dd < d2) d2 = dd;
      if (d2 <= brk2) break;
    }
    if (d2 > brk2) {
      if (++activeOffCount >= STRAY_LIMIT) resetCurrentStroke();
      return;
    }
    activeOffCount = 0;
  }

  const h = head[idx];
  let j = Math.max(0, h - 2);
  while (j < st.length) {
    const dx = st[j].x - u.x;
    const dy = st[j].y - u.y;
    if (dx * dx + dy * dy > tol2) break;
    j++;
  }
  if (j <= h) return; // no forward progress (finger not near the head)

  let coveredPx = 0;
  for (let k = h; k < j - 1; k++) {
    coveredPx += Math.hypot((st[k + 1].x - st[k].x) * scale, (st[k + 1].y - st[k].y) * scale);
  }

  head[idx] = j;
  const tail = screenStrokes[idx][Math.min(j, screenStrokes[idx].length - 1)];
  activeOffCount = 0;

  if (j >= st.length - 1) {
    strokeComplete[idx] = true;
    tickAcc = 0;
    if (soundOn) AudioSynth.ding();
    spawnSparkles(tail.x, tail.y, 10);
    currentStroke++;
    if (currentStroke >= strokes.length) {
      onLetterComplete();
    } else {
      head[currentStroke] = 0;
      activeOffCount = 0;
    }
  } else {
    tickAcc += coveredPx;
    if (soundOn) {
      while (tickAcc >= TICK_STEP_PX) {
        tickAcc -= TICK_STEP_PX;
        AudioSynth.sparkle();
      }
    }
    if (coveredPx > 8) spawnSparkles(tail.x, tail.y, Math.min(4, 1 + Math.floor(coveredPx / 14)));
  }
}

function resetCurrentStroke() {
  if (celebrating) return;
  head[currentStroke] = 0;
  activeOffCount = 0;
  tickAcc = 0;
  if (soundOn) AudioSynth.boing();
}

// --- Reward / celebration --------------------------------------------------
function showRewardCard() {
  const key = currentChar.toUpperCase();
  const entry = (LETTER_WORDS[key] && LETTER_WORDS[key][lang]) || null;
  rewardLetter.textContent = currentChar;
  rewardEmoji.textContent = entry ? entry.emoji : '⭐';
  rewardWord.textContent = entry ? entry.word : '';
  rewardCard.classList.add('visible');
}

function hideRewardCard() {
  rewardCard.classList.remove('visible');
}

function onLetterComplete() {
  if (celebrating || celebrationDone) return;
  celebrating = true;
  celebrationDone = true;
  markLetterComplete(currentChar);
  updateStickerView();
  spawnConfetti();
  if (soundOn) AudioSynth.chime();

  const praise = PRAISE[lang][Math.floor(Math.random() * PRAISE[lang].length)];
  speak(praise, lang);
  setTimeout(() => {
    speak(LETTER_NAMES[lang][currentChar.toUpperCase()], lang);
  }, 900);

  const key = currentChar.toUpperCase();
  const entry = LETTER_WORDS[key] && LETTER_WORDS[key][lang];
  if (entry) {
    setTimeout(() => speak(entry.word, lang), 2100);
  }

  setTimeout(() => showRewardCard(), 450);
  setTimeout(() => {
    hideRewardCard();
    celebrating = false;
    setLetter(letterIndex + 1);
  }, 4800);
}

// --- Rendering -------------------------------------------------------------
function fillArrow(x, y, ang, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(-size * 0.45, size * 0.55);
  ctx.lineTo(-size * 0.45, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const DOT_LEN_UNIT = 55; // strokes shorter than this are treated as dots — no arrow

function dotStroke(i) {
  return strokeUnitLen(i) < DOT_LEN_UNIT;
}

// First sample of stroke i that sits clear of its numbered start circle.
function arrowStartSample(i, r) {
  const scr = screenStrokes[i];
  if (!scr || scr.length < 2) return 0;
  const target = r + 5;
  let dist = 0;
  for (let k = 1; k < scr.length; k++) {
    dist += Math.hypot(scr[k].x - scr[k - 1].x, scr[k].y - scr[k - 1].y);
    if (dist >= target) return k;
  }
  return 0;
}

// One clean directional arrow from the start circle to the stroke's end.
function drawStrokeArrow(i, from, color, w, head) {
  const scr = screenStrokes[i];
  if (!scr || scr.length < 3) return;
  if (dotStroke(i)) return;
  if (from >= scr.length - 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(scr[from].x, scr[from].y);
  for (let k = from + 1; k < scr.length; k++) ctx.lineTo(scr[k].x, scr[k].y);
  ctx.stroke();
  ctx.restore();
  const e0 = scr[scr.length - 1];
  const e1 = scr[Math.max(0, scr.length - 3)];
  fillArrow(e0.x, e0.y, Math.atan2(e0.y - e1.y, e0.x - e1.x), head, color);
}

// White numbered start circles; overlapping circles are pushed apart so the
// numbers always stay legible (handwriter-style).
function drawNumberCircles(now) {
  const { s } = metric();
  const r = 17 * s;
  const pts = screenStrokes.map((scr) => ({ x: scr[0].x, y: scr[0].y }));
  const minSep = r * 2 + 6;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[j].x - pts[i].x;
      const dy = pts[j].y - pts[i].y;
      const d = Math.hypot(dx, dy);
      if (d < minSep) {
        if (d < 0.5) {
          pts[j].x = pts[i].x + minSep;
        } else {
          const k = minSep / d;
          pts[j].x = pts[i].x + dx * k;
          pts[j].y = pts[i].y + dy * k;
        }
      }
    }
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < strokes.length; i++) {
    const done = strokeComplete[i];
    const isCurrent = i === currentStroke;
    const pulse = !done && isCurrent && !demo.active;
    let ring = '#f97316'; // pending orange
    if (done) ring = '#22c55e';
    else if (isCurrent && !demo.active) ring = '#ffb300';
    const rr = pulse ? r * (1 + 0.12 * Math.sin(now / 240)) : r;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, rr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = Math.max(2, 3 * s);
    ctx.strokeStyle = ring;
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, rr, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = ring;
    ctx.font = `bold ${Math.round(rr * 1.1)}px "Fredoka One", sans-serif`;
    ctx.fillText(String(i + 1), pts[i].x, pts[i].y + rr * 0.04);
  }
}

// Soft tint left behind by the auto-write demo on still-pending strokes.
function drawDemoTint() {
  if (!demo.tint || demo.tint.length === 0) return;
  const { s, tube } = metric();
  const fillW = Math.max(4, tube - 4 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(133,92,222,0.4)';
  ctx.lineWidth = fillW;
  for (let i = 0; i < strokes.length; i++) {
    if (strokeComplete[i]) continue;
    const p = demo.tint[i] || 0;
    if (p <= 0) continue;
    const scr = screenStrokes[i];
    const to = Math.max(1, Math.floor(p * (scr.length - 1)));
    if (to >= scr.length) continue;
    ctx.beginPath();
    ctx.moveTo(scr[0].x, scr[0].y);
    for (let k = 1; k <= to; k++) ctx.lineTo(scr[k].x, scr[k].y);
    ctx.stroke();
  }
}

function drawDemoNib() {
  if (!demo.active) return;
  const pos = demoNibPosition();
  if (!pos) return;
  const { s } = metric();
  const r = 12 * s;
  ctx.save();
  ctx.shadowColor = 'rgba(255,112,67,0.85)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff7043';
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

function drawLetter() {
  ctx.clearRect(0, 0, W, H);

  // soft trace-zone background
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 24);
  } else {
    const { x, y, w, h } = zone;
    const r = 24;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  // ghost balloon-letter glyph layer (static)
  ctx.drawImage(guideCanvas, 0, 0, W, H);

  const { s, tube } = metric();
  const fillW = Math.max(4, tube - 4 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawDemoTint();

  // completed strokes — filled green
  for (let i = 0; i < strokes.length; i++) {
    if (!strokeComplete[i]) continue;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = fillW;
    strokePoly(ctx, screenStrokes[i]);
  }

  // active stroke — glowing amber trail up to the head
  const ci = currentStroke;
  if (!strokeComplete[ci] && head[ci] > 0) {
    const scr = screenStrokes[ci];
    const traced = scr.slice(0, head[ci] + 1);
    ctx.save();
    ctx.shadowColor = 'rgba(255,179,0,0.85)';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = fillW;
    ctx.beginPath();
    ctx.moveTo(traced[0].x, traced[0].y);
    for (let k = 1; k < traced.length; k++) ctx.lineTo(traced[k].x, traced[k].y);
    ctx.stroke();
    ctx.restore();
  }

  // one clean directional arrow per unfinished stroke
  const rNum = 17 * s;
  for (let i = 0; i < strokes.length; i++) {
    if (strokeComplete[i]) continue;
    const started = i === ci && head[i] > 0;
    let from = started ? head[i] : arrowStartSample(i, rNum);
    if (started && from < head[i]) from = head[i];
    if (dotStroke(i)) continue;
    if (demo.active && demo.idx === i) continue; // nib is showing this stroke right now
    const isActive = i === ci && !demo.active;
    drawStrokeArrow(i, from, isActive ? 'rgba(255,140,0,0.9)' : 'rgba(249,115,22,0.8)', isActive ? 7 * s : 6 * s, 15 * s);
  }

  drawNumberCircles(performance.now());
  drawDemoNib();
}

// --- Sparkles --------------------------------------------------------------
function spawnSparkles(x, y, n) {
  const colors = ['#ffffff', '#fff3bf', '#ffe58a', '#ffd93d'];
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 20 + Math.random() * 70;
    sparkles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 20,
      r: 1.5 + Math.random() * 2.6,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function updateSparkles(dt) {
  for (const p of sparkles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt * 2.6;
  }
  sparkles = sparkles.filter((p) => p.life > 0);
}

function drawSparkles() {
  for (const p of sparkles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// --- Confetti --------------------------------------------------------------
function spawnConfetti() {
  const colors = ['#ffd93d', '#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa'];
  const cx = W / 2;
  const cy = H / 2;
  particles = [];
  for (let i = 0; i < 90; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 9;
    particles.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 60,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }
}

function updateConfetti(dt) {
  const g = 900;
  for (const p of particles) {
    p.vy += g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr;
    p.life -= dt * 0.55;
  }
  particles = particles.filter((p) => p.life > 0);
}

function drawConfetti() {
  for (const p of particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// --- Main loop -------------------------------------------------------------
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (particles.length > 0) updateConfetti(dt);
  if (sparkles.length > 0) updateSparkles(dt);
  if (demo.active) updateDemo(dt);
  drawLetter();
  drawConfetti();
  drawSparkles();
  requestAnimationFrame(frame);
}

// --- UI / navigation -------------------------------------------------------
prevBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  setLetter(letterIndex - 1);
});

nextBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  setLetter(letterIndex + 1);
});

soundToggle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  soundToggle.querySelector('.game-header__icon').textContent = soundOn ? '🔊' : '🔇';
  saveSettings();
});

fullscreenBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {
      const shown = localStorage.getItem('menulis_fullscreen_hint');
      if (!shown) iosHint.classList.add('visible');
    });
  } else {
    document.exitFullscreen?.();
  }
}

iosHintBtn.addEventListener('pointerdown', () => {
  iosHint.classList.remove('visible');
  localStorage.setItem('menulis_fullscreen_hint', '1');
});

let pendingAction = null;

settingsBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  pendingAction = 'settings';
  showMathGate();
});

helpBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  pendingAction = 'help';
  showMathGate();
});

backBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  pendingAction = 'back';
  showMathGate();
});

stickerBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  pendingAction = 'sticker';
  showMathGate();
});

// --- Math gate -------------------------------------------------------------
function showMathGate() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  mathQuestion.textContent = `${a} + ${b} = ?`;
  mathAnswer.value = '';
  mathAnswer.dataset.sum = a + b;
  mathModal.classList.add('visible');
  setTimeout(() => mathAnswer.focus(), 100);
}

function hideMathGate() {
  mathModal.classList.remove('visible');
}

function resolveAction() {
  if (pendingAction === 'help') {
    helpModal.classList.add('visible');
  } else if (pendingAction === 'back') {
    window.location.href = BACK_URL;
  } else if (pendingAction === 'settings') {
    showSettings();
  } else if (pendingAction === 'sticker') {
    showStickerBook();
  }
  pendingAction = null;
}

mathSubmit.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (parseInt(mathAnswer.value, 10) === parseInt(mathAnswer.dataset.sum, 10)) {
    hideMathGate();
    resolveAction();
  } else {
    hideMathGate();
  }
});

mathCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideMathGate();
  pendingAction = null;
});

mathAnswer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (parseInt(mathAnswer.value, 10) === parseInt(mathAnswer.dataset.sum, 10)) {
      hideMathGate();
      resolveAction();
    } else {
      hideMathGate();
    }
  }
});

// --- Settings panel --------------------------------------------------------
function showSettings() {
  const s = getSettings();
  document.querySelector(`input[name="case"][value="${s.case}"]`).checked = true;
  document.querySelector(`input[name="lang"][value="${s.lang}"]`).checked = true;
  document.getElementById('settings-demo').checked = demoOn !== false;
  renderPicker(s.case);
  settingsPanel.classList.add('visible');
}

function hideSettings() {
  settingsPanel.classList.remove('visible');
}

function renderPicker(caseModeVal) {
  picker.innerHTML = '';
  const set = caseModeVal === 'lower' ? 'abcdefghijklmnopqrstuvwxyz' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const ch of set) {
    const btn = document.createElement('button');
    btn.className = 'picker__btn' + (ch === currentChar ? ' active' : '');
    btn.textContent = ch;
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const i = sequence.indexOf(ch);
      if (i !== -1) setLetter(i);
      hideSettings();
    });
    picker.appendChild(btn);
  }
}

settingsApply.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  caseMode = document.querySelector('input[name="case"]:checked').value;
  lang = document.querySelector('input[name="lang"]:checked').value;
  soundOn = document.getElementById('settings-sound').checked;
  demoOn = document.getElementById('settings-demo').checked;
  soundToggle.querySelector('.game-header__icon').textContent = soundOn ? '🔊' : '🔇';
  saveSettings();
  const prevChar = currentChar;
  buildSequence();
  const i = sequence.indexOf(prevChar);
  if (i !== -1) {
    letterIndex = i;
    setLetter(i);
  } else {
    setLetter(0);
  }
  updateStickerView();
  hideSettings();
});

settingsCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideSettings();
});

// --- Sticker book ----------------------------------------------------------
stickerClose.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideStickerBook();
});

stickerReset.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  completedLetters = [];
  saveProgress(completedLetters);
  updateStickerView();
});

helpClose.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  helpModal.classList.remove('visible');
});

// --- Help text -------------------------------------------------------------
const HELP_TEXT = {
  id: [
    ['👆', 'Telusuri huruf dengan jari telunjuk'],
    ['🔢', 'Mulai dari angka 1, lalu ikuti angkanya berurutan'],
    ['➡️', 'Seret mengikuti garis putus-putus searah panah'],
    ['🖐️', 'Sisi tangan tidak masalah — hanya jari yang diproses'],
    ['🎁', 'Selesaikan huruf untuk membuka kejutan!']
  ],
  en: [
    ['👆', 'Trace the letter with your index finger'],
    ['🔢', 'Start at number 1, then follow the numbers in order'],
    ['➡️', 'Drag along the dashed line in the direction of the arrow'],
    ['🖐️', 'Resting hands are ignored — only your finger counts'],
    ['🎁', 'Finish a letter to unlock a surprise!']
  ]
};

function renderHelp() {
  const steps = document.getElementById('help-steps');
  steps.innerHTML = '';
  HELP_TEXT[lang].forEach(([icon, text], i) => {
    const step = document.createElement('div');
    step.className = 'help-modal__step';
    step.style.animationDelay = `${i * 0.12}s`;
    step.innerHTML = `<span class="help-modal__step-icon">${icon}</span><span class="help-modal__step-text">${text}</span>`;
    steps.appendChild(step);
  });
  const title = document.getElementById('help-title');
  title.textContent = lang === 'id' ? 'Cara Bermain' : 'How to Play';
  const btn = document.getElementById('help-close');
  btn.textContent = lang === 'id' ? 'Mengerti!' : 'Got it!';
}

// --- Init ------------------------------------------------------------------
function init() {
  const s = getSettings();
  caseMode = s.case || 'both';
  soundOn = s.sound !== undefined ? s.sound : true;
  lang = s.lang || 'id';
  demoOn = s.demo !== undefined ? s.demo : true;
  soundToggle.querySelector('.game-header__icon').textContent = soundOn ? '🔊' : '🔇';
  completedLetters = getProgress();
  buildSequence();
  renderHelp();
  resize();
  setLetter(0);
  updateStickerView();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      refreshScreenStrokes();
      buildGuide();
    });
  }
  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => {
  resize();
});

init();
