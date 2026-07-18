import { randomBetween } from '../../js/shared.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';

const COLORS = [
  '#E74C3C',
  '#3498DB',
  '#F1C40F',
  '#2ECC71',
  '#E67E22',
  '#9B59B6',
  '#FF6B9D',
  '#8B5E3C',
  '#FFFFFF',
];

const SHAPE_NAMES = [
  'circle', 'square', 'triangle', 'rectangle', 'star',
  'heart', 'oval', 'diamond', 'hexagon', 'crescent'
];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const soundToggle = document.getElementById('sound-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const backBtn = document.getElementById('back-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');
const mathModal = document.getElementById('math-modal');
const mathQuestion = document.getElementById('math-question');
const mathAnswer = document.getElementById('math-answer');
const mathSubmit = document.getElementById('math-submit');
const mathCancel = document.getElementById('math-cancel');

let mathA = 0, mathB = 0, mathSum = 0;
let pendingAction = null;

function showMathGate(action) {
  mathA = Math.floor(Math.random() * 8) + 1;
  mathB = Math.floor(Math.random() * 8) + 1;
  mathSum = mathA + mathB;
  pendingAction = action;
  mathQuestion.textContent = `${mathA} + ${mathB} = ?`;
  mathAnswer.value = '';
  mathModal.classList.add('visible');
  setTimeout(() => mathAnswer.focus(), 100);
}

function hideMathGate() {
  mathModal.classList.remove('visible');
  pendingAction = null;
}

mathSubmit.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const val = parseInt(mathAnswer.value, 10);
  if (val === mathSum && pendingAction) {
    pendingAction();
  }
  hideMathGate();
});

mathCancel.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  hideMathGate();
});

mathAnswer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = parseInt(mathAnswer.value, 10);
    if (val === mathSum && pendingAction) {
      pendingAction();
    }
    hideMathGate();
  }
});

helpBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathGate(() => {
    helpModal.classList.add('visible');
  });
});

helpClose.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  helpModal.classList.remove('visible');
});

backBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  showMathGate(() => {
    window.location.href = '../../index.html';
  });
});

fullscreenBtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

let soundOn = true;
let firstTap = false;
let audioReady = false;
const shapes = [];

const svgCache = new Map();

function loadSvg(name, color) {
  const key = `${name}-${color}`;
  if (svgCache.has(key)) {
    return Promise.resolve(svgCache.get(key));
  }

  return fetch(`assets/svg/${name}.svg`)
    .then(res => res.text())
    .then(svgText => {
      const colored = svgText.replace(/currentColor/g, color);
      const blob = new Blob([colored], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          svgCache.set(key, img);
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.src = url;
      });
    });
}

function resize() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

window.addEventListener('resize', resize);
resize();

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  const use = soundToggle.querySelector('use');
  use.setAttribute('href',
    soundOn
      ? '../../assets/svg/icons.svg#icon-sound-on'
      : '../../assets/svg/icons.svg#icon-sound-off'
  );
});

class FloatingShape {
  constructor(x, y, name, color) {
    this.x = x;
    this.y = y;
    this.size = randomBetween(30, 70);
    this.color = color;
    this.name = name;
    this.img = null;
    this.opacity = 1;
    this.vx = randomBetween(-1.5, 1.5);
    this.vy = randomBetween(-3, -1);
    this.rotation = 0;
    this.rotationSpeed = randomBetween(-0.0015, 0.0015);
    this.life = 1;
    this.decay = randomBetween(0.004, 0.008);
    this.scale = 0.1;
    this.targetScale = 1;
  }

  update() {
    if (this.scale < this.targetScale) {
      this.scale += 0.08;
      if (this.scale > this.targetScale) this.scale = this.targetScale;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.life -= this.decay;
    this.opacity = Math.max(0, this.life);

    if (this.life <= 0.5) {
      this.targetScale = 0;
    }
  }

  draw(ctx) {
    if (this.opacity <= 0 || !this.img) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    const s = this.size;
    ctx.drawImage(this.img, -s, -s, s * 2, s * 2);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  get isDead() {
    return this.life <= 0;
  }
}

async function spawnShape(x, y) {
  const name = SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  try {
    const img = await loadSvg(name, color);
    const shape = new FloatingShape(x, y, name, color);
    shape.img = img;
    shapes.push(shape);
  } catch (e) {
    // fallback silently
  }

  if (!audioReady) {
    await unlockAudio();
    audioReady = true;
  }

  if (soundOn) {
    AudioSynth.random();
  }

  if (!firstTap) {
    firstTap = true;
    hint.classList.add('hidden');
  }
}

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

canvas.addEventListener('click', (e) => {
  spawnShape(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const pos = getEventPos(e);
  spawnShape(pos.x, pos.y);
}, { passive: false });

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    s.update();
    s.draw(ctx);
    if (s.isDead) {
      shapes.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
