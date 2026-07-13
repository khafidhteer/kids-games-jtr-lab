export const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC93C', '#6BCB77',
  '#4D96FF', '#9B59B6', '#FF69B4', '#00D2FF',
  '#FF4757', '#FFA502', '#2ED573', '#1E90FF',
  '#E056A0', '#5F27CD', '#01A3A4', '#F368E0',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#01CDCD'
];

export function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export const Shapes = {
  circle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  },

  star(ctx, x, y, outerR, color) {
    const innerR = outerR * 0.4;
    const spikes = 5;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  heart(ctx, x, y, size, color) {
    ctx.beginPath();
    const topY = y - size * 0.4;
    ctx.moveTo(x, y + size * 0.6);
    ctx.bezierCurveTo(x - size, y - size * 0.2, x - size * 0.5, topY - size * 0.5, x, topY + size * 0.2);
    ctx.bezierCurveTo(x + size * 0.5, topY - size * 0.5, x + size, y - size * 0.2, x, y + size * 0.6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  blob(ctx, x, y, radius, color) {
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wobble = radius * (0.7 + Math.random() * 0.6);
      const px = x + Math.cos(angle) * wobble;
      const py = y + Math.sin(angle) * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else {
        const cpAngle = ((i - 0.5) / points) * Math.PI * 2;
        const cpR = radius * (0.8 + Math.random() * 0.4);
        const cpx = x + Math.cos(cpAngle) * cpR;
        const cpy = y + Math.sin(cpAngle) * cpR;
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  diamond(ctx, x, y, size, color) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.6, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.6, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  triangle(ctx, x, y, size, color) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.87, y + size * 0.5);
    ctx.lineTo(x - size * 0.87, y + size * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
};

const SHAPE_NAMES = Object.keys(Shapes);

export function randomShape() {
  return SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
}

export function drawRandomShape(ctx, x, y, size, color) {
  const name = randomShape();
  Shapes[name](ctx, x, y, size, color);
  return name;
}

export function navigateTo(path) {
  window.location.href = path;
}
