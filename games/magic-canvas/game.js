import { COLORS, randomColor, randomBetween, randomShape, Shapes } from '../../js/shared.js';
import { AudioSynth, unlockAudio } from '../../js/audio.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');
const soundToggle = document.getElementById('sound-toggle');

let soundOn = true;
let firstTap = false;
let audioReady = false;
const shapes = [];

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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = randomBetween(30, 70);
    this.color = randomColor();
    this.shape = randomShape();
    this.opacity = 1;
    this.vx = randomBetween(-1.5, 1.5);
    this.vy = randomBetween(-3, -1);
    this.rotation = 0;
    this.rotationSpeed = randomBetween(-0.03, 0.03);
    this.life = 1;
    this.decay = randomBetween(0.004, 0.008);
    this.scale = 0.1;
    this.targetScale = 1;
    this.popped = false;
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
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    Shapes[this.shape](ctx, 0, 0, this.size, this.color);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  get isDead() {
    return this.life <= 0;
  }
}

async function spawnShape(x, y) {
  shapes.push(new FloatingShape(x, y));

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
