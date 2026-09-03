import { LETTERS } from './letters.js';
import { PRAISE, LETTER_NAMES } from './praise.js';
import { LETTER_WORDS } from './words.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';
import { initSafeguards } from '../../js/safeguard.js';

initSafeguards();

const STORAGE_KEY = 'menulis_huruf_settings';

// --- Geometry / layout constants -------------------------------------------
const HEADER_H = 64;
const BOTTOM_BAND = 170;  // bottom area reserved for nav arrows + guide chips
const SIDE = 24;
const PALM_SIZE = 60;
const SAMPLE_STEP = 4;
const TUBE_W = 34;         // rail tube width at scale factor 1 (CSS px)
const TICK_STEP_PX = 70;   // sparkle cadence while the puck rolls along the rail

// Puck / rail interaction tuning (CSS px) — ported from the reference mechanic.
const RELEASE_PX = 90;     // finger this far from the puck -> let go
const SNAP_PX = 60;        // finger this close to the rail -> puck follows it
const END_SNAP = 32;       // puck this close to the stroke end -> stroke done
const LOOKAHEAD_PX = 100;  // how far ahead of the puck the rail is scanned

const INK = '#38bdf8';         // ink that fills the rail as the puck travels
const RAIL_RIM = 'rgba(15,23,42,0.25)';
const RAIL_CORE = '#ffffff';
const RAIL_DASH = '#94a3b8';
const PUCK = '#22c55e';
const PUCK_ON = '#15803d';

const BACK_URL = '../../index.html';

// --- DOM -------------------------------------------------------------------
const canvas = document.getElementById('trace-canvas');
const ctx = canvas.getContext('2d');
const modeIndicator = document.getElementById('mode-indicator');
const prevBtn = document.getElementById('prev-letter');
const nextBtn = document.getElementById('next-letter');
const letterDots = document.getElementById('letter-dots');
const soundToggle = document.getElementById('sound-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsBtn = document.getElementById('settings-btn');
const helpBtn = document.getElementById('help-btn');
const backBtn = document.getElementById('back-btn');

const mathModal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');

const settingsPanel = document.getElementById('settings-panel');
const settingsApply = document.getElementById('settings-apply');
const settingsCancel = document.getElementById('settings-cancel');
const picker = document.getElementById('letter-picker');

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

let sequence = [];
let letterIndex = 0;
let currentChar = 'A';

// Static layers
let guide = null;  // rails + dashed center lines
let ink = null;    // persistent, masked ink trail (accumulates)
let mask = null;   // tube silhouette used to clip the ink

// Current letter state
let strokes = [];        // sampled strokes (unit space) — array of arrays {x,y}
let screenStrokes = [];  // same strokes in screen space (cached)
let strokeComplete = []; // per stroke flag
let currentStroke = 0;
let segIndex = 0;        // segment of the rail the puck currently sits on
let puckPos = { x: 0, y: 0 };
let puckAngle = 0;
let isDragging = false;
let celebrating = false;
let celebrationDone = false;

// Confetti + sparkle particles
let particles = [];
let sparkles = [];

// Tracing audio / sparkle throttling
let tickAcc = 0;

// Transient on-canvas message pill
let msg = null;          // { text, color, until }

const pointers = new Map(); // pointerId -> { x, y, w, h, down }
let activeId = null;
let grabbedId = null;      // pointerId currently dragging the puck
let lastFinger = { x: 0, y: 0 };

// --- Settings --------------------------------------------------------------
function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { case: 'both', sound: true, lang: 'id' };
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ case: caseMode, sound: soundOn, lang }));
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
  currentStroke = 0;
  segIndex = 0;
  isDragging = false;
  celebrating = false;
  celebrationDone = false;
  sparkles = [];
  tickAcc = 0;
  msg = null;
  clearInk();
  computeLayout();
  refreshScreenStrokes();
  buildStatic();
  const first = screenStrokes[0];
  if (first && first.length) puckPos = { x: first[0].x, y: first[0].y };
  updatePuckAngle();
  updateModeIndicator();
}

function updateModeIndicator() {
  const caseLabel = { upper: lang === 'id' ? 'HURUF BESAR' : 'UPPERCASE', lower: lang === 'id' ? 'HURUF KECIL' : 'LOWERCASE', both: lang === 'id' ? 'SEMUA HURUF' : 'ALL LETTERS' }[caseMode];
  modeIndicator.textContent = caseLabel;
}

// --- Sampling (Catmull-Rom interpolation for smooth curves) ----------------
function sampleStroke(points) {
  const out = [];
  if (points.length < 2) return out;
  if (points.length === 2) {
    const [ax, ay] = points[0];
    const [bx, by] = points[1];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    const n = Math.max(1, Math.floor(len / SAMPLE_STEP));
    for (let j = 0; j < n; j++) out.push({ x: ax + (dx * j) / n, y: ay + (dy * j) / n });
    out.push({ x: bx, y: by });
    return out;
  }

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

// --- Scale helpers ---------------------------------------------------------
function factor() {
  return Math.min(1.6, scale);
}

function tubeW() {
  return Math.max(18, TUBE_W * factor());
}

function puckR() {
  return Math.max(13, tubeW() * 0.5);
}

// --- Layers / layout -------------------------------------------------------
function makeLayer() {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  return { canvas: c, ctx: g };
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
  if (!guide) guide = makeLayer();
  if (!ink) ink = makeLayer();
  if (!mask) mask = makeLayer();
  for (const l of [guide, ink, mask]) {
    l.canvas.width = W * dpr;
    l.canvas.height = H * dpr;
    l.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  zone = { x: SIDE, y: HEADER_H + 6, w: W - SIDE * 2, h: H - HEADER_H - BOTTOM_BAND - 6 };
  computeLayout();
  if (currentChar) resetLetter();
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

function refreshScreenStrokes() {
  screenStrokes = strokes.map((pts) => pts.map((p) => toScreen(p.x, p.y)));
}

function tracePath(pen, scr) {
  pen.beginPath();
  pen.moveTo(scr[0].x, scr[0].y);
  for (let i = 1; i < scr.length; i++) pen.lineTo(scr[i].x, scr[i].y);
}

function clearInk() {
  ink.ctx.clearRect(0, 0, W, H);
}

// Draw the static "rail" look: soft rim, bright tube core, dashed center line.
// Also (re)build the black tube mask used to clip the ink into the rails.
function buildStatic() {
  const g = guide.ctx;
  const m = mask.ctx;
  g.clearRect(0, 0, W, H);
  m.clearRect(0, 0, W, H);
  if (!screenStrokes.length) return;

  const s = factor();
  const w = tubeW();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  m.lineCap = 'round';
  m.lineJoin = 'round';

  // rim / shadow ring around every rail
  g.strokeStyle = RAIL_RIM;
  g.lineWidth = w + 6 * s;
  for (const scr of screenStrokes) { tracePath(g, scr); g.stroke(); }

  // bright tube core
  g.strokeStyle = RAIL_CORE;
  g.lineWidth = w;
  for (const scr of screenStrokes) { tracePath(g, scr); g.stroke(); }

  // dashed center line that shows the exact path to follow
  g.strokeStyle = RAIL_DASH;
  g.lineWidth = Math.max(2, 2.4 * s);
  g.setLineDash([7 * s, 9 * s]);
  for (const scr of screenStrokes) { tracePath(g, scr); g.stroke(); }
  g.setLineDash([]);

  // mask for ink clipping (slightly wider than the ink so edges stay crisp)
  m.strokeStyle = '#000';
  m.lineWidth = w + 8 * s;
  for (const scr of screenStrokes) { tracePath(m, scr); m.stroke(); }
}

// Paint a section of ink between two rail points, clipped to the tube mask.
// The mask clip is limited to the segment's bounding box so it stays cheap.
function paintInk(p1, p2) {
  const g = ink.ctx;
  const s = factor();
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.lineWidth = tubeW() + 2 * s;
  g.strokeStyle = INK;
  g.beginPath();
  g.moveTo(p1.x, p1.y);
  g.lineTo(p2.x, p2.y);
  g.stroke();

  const m = tubeW() + 10 * s;
  const x0 = Math.max(0, Math.floor(Math.min(p1.x, p2.x) - m));
  const y0 = Math.max(0, Math.floor(Math.min(p1.y, p2.y) - m));
  const x1 = Math.min(W, Math.ceil(Math.max(p1.x, p2.x) + m));
  const y1 = Math.min(H, Math.ceil(Math.max(p1.y, p2.y) + m));
  const w = x1 - x0;
  const h = y1 - y0;
  if (w > 0 && h > 0) {
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(mask.canvas, x0 * dpr, y0 * dpr, w * dpr, h * dpr, x0, y0, w, h);
  }
  g.restore();
}

// --- Puck logic ------------------------------------------------------------
function projectToSegment(P, A, B) {
  const abx = B.x - A.x;
  const aby = B.y - A.y;
  const l2 = abx * abx + aby * aby;
  if (l2 === 0) return { point: { x: A.x, y: A.y }, dist: Math.hypot(P.x - A.x, P.y - A.y) };
  let t = ((P.x - A.x) * abx + (P.y - A.y) * aby) / l2;
  t = Math.max(0, Math.min(1, t));
  return { point: { x: A.x + t * abx, y: A.y + t * aby }, dist: Math.hypot(P.x - (A.x + t * abx), P.y - (A.y + t * aby)) };
}

function updatePuckAngle() {
  const scr = screenStrokes[currentStroke];
  if (!scr || scr.length < 2) return;
  const look = Math.min(segIndex + 3, scr.length - 1);
  const tp = scr[look];
  const dx = tp.x - puckPos.x;
  const dy = tp.y - puckPos.y;
  if (Math.hypot(dx, dy) > 1) puckAngle = Math.atan2(dy, dx);
}

function setMessage(text, color, ms) {
  msg = { text, color, until: performance.now() + (ms || 2200) };
}

function grabHint() {
  return lang === 'id' ? 'Pegang bola hijau di garis, lalu seret!' : 'Grab the green ball, then drag!';
}

function nextStrokeMsg() {
  return lang === 'id' ? 'Bagus! Seret ke goresan berikutnya.' : 'Great! Drag the next stroke.';
}

function finishStroke() {
  const scr = screenStrokes[currentStroke];
  const last = scr[scr.length - 1];
  paintInk(puckPos, last);
  puckPos = { x: last.x, y: last.y };
  strokeComplete[currentStroke] = true;
  spawnSparkles(last.x, last.y, 16);
  if (soundOn) AudioSynth.ding();
  currentStroke++;
  segIndex = 0;
  if (currentStroke >= strokes.length) {
    isDragging = false;
    onLetterComplete();
    return;
  }
  setMessage(nextStrokeMsg(), '#7dd3fc', 1700);
  const next0 = screenStrokes[currentStroke][0];
  puckPos = { x: next0.x, y: next0.y };
  updatePuckAngle();
  if (isDragging && Math.hypot(lastFinger.x - puckPos.x, lastFinger.y - puckPos.y) > RELEASE_PX) {
    isDragging = false;
  }
}

function puckDrag(sx, sy) {
  const scr = screenStrokes[currentStroke];
  if (!scr || scr.length < 2) {
    isDragging = false;
    return;
  }
  const pos = { x: sx, y: sy };
  if (Math.hypot(pos.x - puckPos.x, pos.y - puckPos.y) > RELEASE_PX) {
    isDragging = false;
    return;
  }

  let bestSeg = segIndex;
  let bestDist = Infinity;
  let best = null;
  let ahead = 0;
  const maxI = Math.min(scr.length - 2, segIndex + 160);
  for (let i = segIndex; i <= maxI; i++) {
    const pr = projectToSegment(pos, scr[i], scr[i + 1]);
    if (pr.dist < bestDist) {
      bestDist = pr.dist;
      bestSeg = i;
      best = pr.point;
    }
    if (i > segIndex) {
      ahead += Math.hypot(scr[i].x - scr[i - 1].x, scr[i].y - scr[i - 1].y);
      if (ahead > LOOKAHEAD_PX) break;
    }
  }

  if (bestDist < SNAP_PX && best) {
    const covered = Math.hypot(best.x - puckPos.x, best.y - puckPos.y);
    if (covered > 0.5) {
      paintInk(puckPos, best);
      puckPos = best;
      segIndex = bestSeg;
      tickAcc += covered;
      while (tickAcc >= TICK_STEP_PX) {
        tickAcc -= TICK_STEP_PX;
        if (soundOn) AudioSynth.sparkle();
        spawnSparkles(puckPos.x, puckPos.y, 1);
      }
      updatePuckAngle();

      const last = scr[scr.length - 1];
      const dEnd = Math.hypot(puckPos.x - last.x, puckPos.y - last.y);
      if (segIndex >= scr.length - 6 && dEnd < END_SNAP) {
        finishStroke();
      }
    }
  }
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

// --- Pointer input ---------------------------------------------------------
function inZone(x, y) {
  return x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
}

function inBand(x, y) {
  return y >= H - BOTTOM_BAND + 4 && y <= H - 40;
}

function contactSize(p) {
  if (p.w > 1 && p.h > 1) return (p.w + p.h) / 2;
  return 0;
}

function isPalm(p) {
  const s = contactSize(p);
  return s > 0 ? s > PALM_SIZE : false;
}

function isFinger(p) {
  return p.down && !isPalm(p);
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

function inResetPill(x, y) {
  const pill = bottomPillRect(resetLabel());
  return x >= pill.x && x <= pill.x + pill.w && y >= pill.y && y <= pill.y + pill.h;
}

function onPointerDown(e) {
  if (celebrating) return;
  if (!audioReady) {
    unlockAudio();
    audioReady = true;
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, w: e.width || 0, h: e.height || 0, down: true });
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (err) {}
  recomputeActive();

  if (activeId !== e.pointerId) return;
  const p = pointers.get(e.pointerId);
  if (!isFinger(p)) return;

  // reset chip lives below the trace zone (only when no message is shown)
  if (inBand(e.clientX, e.clientY)) {
    if (!msg && inResetPill(e.clientX, e.clientY)) {
      resetLetter();
    }
    return;
  }
  if (!inZone(e.clientX, e.clientY)) return;

  grabbedId = e.pointerId;
  const grabR = puckR() + 26;
  const d = Math.hypot(e.clientX - puckPos.x, e.clientY - puckPos.y);
  if (d <= grabR) {
    isDragging = true;
    lastFinger = { x: e.clientX, y: e.clientY };
    msg = null;
  } else {
    setMessage(grabHint(), '#fbbf24', 1800);
  }
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
    recomputeActive();
  }
  if (celebrating) return;

  if (grabbedId === e.pointerId) {
    const gp = pointers.get(e.pointerId);
    if (gp && !isFinger(gp)) {
      grabbedId = null;
      isDragging = false;
      return;
    }
    lastFinger = { x: e.clientX, y: e.clientY };
    if (!isDragging) {
      if (!inBand(e.clientX, e.clientY)) {
        const grabR = puckR() + 26;
        const d = Math.hypot(e.clientX - puckPos.x, e.clientY - puckPos.y);
        if (d <= grabR) {
          isDragging = true;
          msg = null;
        }
      }
      return;
    }
    puckDrag(e.clientX, e.clientY);
  }
}

function onPointerUp(e) {
  pointers.delete(e.pointerId);
  if (grabbedId === e.pointerId) {
    grabbedId = null;
    isDragging = false;
  }
  if (activeId === e.pointerId) {
    activeId = null;
    recomputeActive();
  }
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);

// --- Sparkles --------------------------------------------------------------
function spawnSparkles(x, y, n) {
  const colors = ['#ffffff', '#bae6fd', '#7dd3fc', '#38bdf8'];
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 30 + Math.random() * 90;
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
  const cy = zone.y + zone.h * 0.4;
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

// --- Scene drawing ---------------------------------------------------------
function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  if (typeof g.roundRect === 'function') {
    g.roundRect(x, y, w, h, r);
    return;
  }
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function resetLabel() {
  return lang === 'id' ? '↺ Ulangi' : '↺ Redo';
}

// Single pill slot between the trace zone and the nav arrows. It shows the
// "Ulangi" reset chip by default; transient coaching messages borrow the slot.
function bottomPillRect(text) {
  ctx.font = `bold 16px "Fredoka One", "Segoe UI", sans-serif`;
  const tw = ctx.measureText(text).width;
  const w = Math.min(W - 24, Math.max(124, tw + 60));
  const h = 44;
  const cx = W / 2;
  const cy = H - BOTTOM_BAND + 24;
  return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
}

function drawPillText(text, color, alpha) {
  const pill = bottomPillRect(text);
  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(15,23,42,0.55)';
  roundRectPath(ctx, pill.x, pill.y, pill.w, pill.h, pill.h / 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pill.x, pill.y, pill.w, pill.h, pill.h / 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `bold 16px "Fredoka One", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pill.cx, pill.cy + 1);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = 1;
}

function drawBottomPill(now) {
  if (celebrating) return;
  if (msg) {
    if (now > msg.until) {
      msg = null;
    } else {
      drawPillText(msg.text, msg.color, (msg.until - now) / 500);
      return;
    }
  }
  drawPillText(resetLabel(), '#ffffff', 1);
}

function drawPuck(now) {
  if (celebrating) return;
  const scr = screenStrokes[currentStroke];
  if (!scr) return;
  if (currentStroke >= strokes.length) return;
  const r = puckR();
  const idle = !isDragging;
  const pulse = idle ? 1 + 0.10 * Math.sin(now / 280) : 1;

  ctx.save();
  ctx.translate(puckPos.x, puckPos.y);

  ctx.beginPath();
  ctx.arc(0, 0, (r + 5) * pulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.shadowColor = 'rgba(34,197,94,0.9)';
  ctx.shadowBlur = idle ? 16 : 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = isDragging ? PUCK_ON : PUCK;
  ctx.fill();

  ctx.rotate(puckAngle);
  const tip = r * 0.42;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(tip, 0);
  ctx.lineTo(-tip * 0.55, -tip * 0.7);
  ctx.lineTo(-tip * 0.18, 0);
  ctx.lineTo(-tip * 0.55, tip * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawScene(now) {
  ctx.clearRect(0, 0, W, H);
  if (guide) ctx.drawImage(guide.canvas, 0, 0, W, H);
  if (ink) ctx.drawImage(ink.canvas, 0, 0, W, H);
  drawPuck(now);
  drawBottomPill(now);
  drawConfetti();
  drawSparkles();
}

// --- Main loop -------------------------------------------------------------
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (particles.length > 0) updateConfetti(dt);
  if (sparkles.length > 0) updateSparkles(dt);
  drawScene(now);
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
    renderHelp();
    helpModal.classList.add('visible');
  } else if (pendingAction === 'back') {
    window.location.href = BACK_URL;
  } else if (pendingAction === 'settings') {
    showSettings();
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
  document.getElementById('settings-sound').checked = soundOn;
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
  hideSettings();
});

settingsCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideSettings();
});

helpClose.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  helpModal.classList.remove('visible');
});

// --- Help text -------------------------------------------------------------
const HELP_TEXT = {
  id: [
    ['👆', 'Genggam bola hijau di garis terang'],
    ['➡️', 'Seret bola mengikuti arah panah di atasnya'],
    ['🔵', 'Garis yang sudah dilewati berubah jadi biru'],
    ['🔢', 'Selesaikan satu goresan, lalu lanjut ke goresan berikutnya'],
    ['🎁', 'Selesaikan huruf untuk membuka kejutan!']
  ],
  en: [
    ['👆', 'Grab the green ball on the bright line'],
    ['➡️', 'Drag the ball along, following the arrow on it'],
    ['🔵', 'The line you passed turns blue'],
    ['🔢', 'Finish one stroke, then move on to the next'],
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
  soundToggle.querySelector('.game-header__icon').textContent = soundOn ? '🔊' : '🔇';
  buildSequence();
  renderHelp();
  resize();
  setLetter(0);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => {
  resize();
});

init();
