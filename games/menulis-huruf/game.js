import { LETTERS } from './letters.js';
import { PRAISE, LETTER_NAMES } from './praise.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';
import { speak } from '../../js/speech.js';
import { initSafeguards } from '../../js/safeguard.js';

initSafeguards();

const STORAGE_KEY = 'menulis_huruf_settings';

// --- Geometry / layout constants -------------------------------------------
const HEADER_H = 64;
const BOTTOM_BAND = 130;
const SIDE = 24;
const TOLERANCE_PX = 42;
const PALM_SIZE = 60;
const SAMPLE_STEP = 4;
const ARROW_STEP = 150;

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

const mathModal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');

const settingsPanel = document.getElementById('settings-panel');
const settingsApply = document.getElementById('settings-apply');
const settingsCancel = document.getElementById('settings-cancel');
const picker = document.getElementById('letter-picker');

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

let strokes = [];        // sampled strokes: array of arrays of {x,y} (unit space)
let strokeComplete = []; // per stroke
let head = [];           // head sample index per stroke
let currentStroke = 0;
let celebrating = false;
let celebrationDone = false;

const pointers = new Map(); // pointerId -> { x, y, w, h, down }
let activeId = null;
let lastTap = 0;

// Confetti particles
let particles = [];

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
  letterLabel.textContent = currentChar;
  updateModeIndicator();
  computeLayout();
}

function updateModeIndicator() {
  const caseLabel = { upper: lang === 'id' ? 'HURUF BESAR' : 'UPPERCASE', lower: lang === 'id' ? 'HURUF KECIL' : 'LOWERCASE', both: lang === 'id' ? 'SEMUA HURUF' : 'ALL LETTERS' }[caseMode];
  modeIndicator.textContent = caseLabel;
}

// --- Sampling --------------------------------------------------------------
function sampleStroke(points) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    const n = Math.max(1, Math.floor(len / SAMPLE_STEP));
    for (let j = 0; j < n; j++) {
      out.push({ x: ax + (dx * j) / n, y: ay + (dy * j) / n });
    }
  }
  out.push({ x: points[points.length - 1][0], y: points[points.length - 1][1] });
  return out;
}

// --- Layout ----------------------------------------------------------------
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  zone = { x: SIDE, y: HEADER_H + 6, w: W - SIDE * 2, h: H - HEADER_H - BOTTOM_BAND - 12 };
  computeLayout();
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
  const st = strokes[currentStroke];
  if (!st) return;

  const h = head[currentStroke];
  let j = Math.max(0, h - 2);
  while (j < st.length) {
    const dx = st[j].x - u.x;
    const dy = st[j].y - u.y;
    if (dx * dx + dy * dy > tol2) break;
    j++;
  }
  if (j <= h) return; // no forward progress (finger not near the head)

  head[currentStroke] = j;
  if (j >= st.length - 1) {
    strokeComplete[currentStroke] = true;
    if (soundOn) AudioSynth.ding();
    currentStroke++;
    if (currentStroke >= strokes.length) {
      onLetterComplete();
    } else {
      head[currentStroke] = 0;
    }
  }
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
  }, 1200);

  setTimeout(() => {
    celebrating = false;
    setLetter(letterIndex + 1);
  }, 3000);
}

// --- Rendering -------------------------------------------------------------
function drawPath(points, screenPoints) {
  ctx.beginPath();
  ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
  for (let i = 1; i < screenPoints.length; i++) {
    ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
  }
  ctx.stroke();
}

function drawArrowheads(points, screenPoints, color) {
  ctx.fillStyle = color;
  let dist = 0;
  let last = 0;
  for (let i = 1; i < points.length; i++) {
    dist += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (dist - last >= ARROW_STEP) {
      last = dist;
      const s = screenPoints[i];
      const t = screenPoints[Math.max(0, i - 2)];
      const ang = Math.atan2(s.y - t.y, s.x - t.x);
      const size = 14 * Math.min(1.6, scale / 12);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(size * 0.6, 0);
      ctx.lineTo(-size * 0.4, size * 0.5);
      ctx.lineTo(-size * 0.4, -size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

function drawLetter() {
  ctx.clearRect(0, 0, W, H);

  // soft trace-zone background
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  roundRectPath(zone.x, zone.y, zone.w, zone.h, 24);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < strokes.length; i++) {
    const pts = strokes[i];
    const scr = pts.map((p) => toScreen(p.x, p.y));
    const done = strokeComplete[i];
    const isCurrent = i === currentStroke;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // dim background path
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 12 * Math.min(1.6, scale / 10);
    drawPath(pts, scr);

    // bright traced path
    if (done) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 12 * Math.min(1.6, scale / 10);
      drawPath(pts, scr);
    } else if (isCurrent && head[i] > 0) {
      const traced = scr.slice(0, head[i] + 1);
      ctx.strokeStyle = '#ffd93d';
      ctx.lineWidth = 12 * Math.min(1.6, scale / 10);
      ctx.beginPath();
      ctx.moveTo(traced[0].x, traced[0].y);
      for (let k = 1; k < traced.length; k++) ctx.lineTo(traced[k].x, traced[k].y);
      ctx.stroke();
    }

    // direction arrows on the not-yet-done portion
    if (!done) {
      drawArrowheads(pts, scr, 'rgba(255,255,255,0.35)');
    }
  }

  drawStartDots();
}

function drawStartDots() {
  for (let i = 0; i < strokes.length; i++) {
    const start = strokes[i][0];
    const s = toScreen(start.x, start.y);
    const done = strokeComplete[i];
    const isCurrent = i === currentStroke;
    const r = 16 * Math.min(1.6, scale / 10);

    if (done) {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (isCurrent) {
      const pulse = 1 + 0.3 * Math.sin(performance.now() / 250);
      ctx.fillStyle = '#ffd93d';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
  drawLetter();
  drawConfetti();
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
    ['👆', 'Telusuri huruf dengan jari telunjuk'],
    ['🎯', 'Ikuti titik dan panah untuk setiap guratan'],
    ['🖐️', 'Sisi tangan tidak masalah — hanya jari yang diproses'],
    ['🎉', 'Dapatkan pujian setelah menyelesaikan huruf!']
  ],
  en: [
    ['👆', 'Trace the letter with your index finger'],
    ['🎯', 'Follow the dots and arrows for each stroke'],
    ['🖐️', 'Resting hands are ignored — only your finger counts'],
    ['🎉', 'Get praised when you finish a letter!']
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
