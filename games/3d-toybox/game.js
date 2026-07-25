import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
import { unlockAudio, AudioSynth } from '../../js/audio.js';
import { speak } from '../../js/speech.js';

let currentLang = 'id';
let audioReady = false;
let soundOn = true;
let emojiStartIndex = 0;
let scene, camera, renderer, clock;
let currentGroup = null;
let currentObjectIndex = -1;
let isDragging = false;
let pointerStartX = 0;
let pointerStartY = 0;

const VISIBLE_EMOJIS = 3;

const COLORS = [
  0xE74C3C, 0x3498DB, 0xF1C40F, 0x2ECC71, 0xE67E22,
  0x9B59B6, 0xFF6B9D, 0x1ABC9C, 0xF39C12, 0x2980B9,
  0x8E44AD, 0x27AE60, 0xD35400, 0x16A085, 0xC0392B,
  0x7FB3D8, 0xF7DC6F, 0x82E0AA, 0xF1948A, 0xBB8FCE,
];

function mat(T, c, opts = {}) {
  return new T.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.15, ...opts });
}

function createGlobeTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a6ba0';
  ctx.fillRect(0, 0, 512, 256);
  const blobs = [
    { x: 180, y: 100, rx: 80, ry: 60, color: '#4a9e4a' },
    { x: 200, y: 150, rx: 40, ry: 30, color: '#3d8b3d' },
    { x: 280, y: 80, rx: 100, ry: 70, color: '#5aae5a' },
    { x: 290, y: 140, rx: 50, ry: 40, color: '#4a9e4a' },
    { x: 340, y: 110, rx: 60, ry: 50, color: '#6abe6a' },
    { x: 400, y: 130, rx: 30, ry: 40, color: '#4a9e4a' },
    { x: 100, y: 80, rx: 60, ry: 80, color: '#4a9e4a' },
    { x: 90, y: 140, rx: 40, ry: 50, color: '#3d8b3d' },
    { x: 350, y: 170, rx: 30, ry: 20, color: '#5aae5a' },
    { x: 260, y: 40, rx: 30, ry: 15, color: '#8acc8a' },
  ];
  blobs.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  return new THREE.CanvasTexture(c);
}

function buildGeometric(T, id, color) {
  const geoMap = {
    sphere: [T.SphereGeometry, 0.4, 24, 24],
    box: [T.BoxGeometry, 0.6, 0.6, 0.6],
    cylinder: [T.CylinderGeometry, 0.3, 0.3, 0.5, 24],
    cone: [T.ConeGeometry, 0.35, 0.55, 24],
    torus: [T.TorusGeometry, 0.35, 0.12, 16, 24],
    ring: [T.RingGeometry, 0.2, 0.4, 24],
    tetrahedron: [T.TetrahedronGeometry, 0.45],
    octahedron: [T.OctahedronGeometry, 0.4],
    dodecahedron: [T.DodecahedronGeometry, 0.38],
    torusknot: [T.TorusKnotGeometry, 0.3, 0.1, 48, 8],
    icosahedron: [T.IcosahedronGeometry, 0.4],
  };
  const params = geoMap[id];
  if (!params) return null;
  const [ctor, ...args] = params;
  return new THREE.Mesh(new ctor(...args), mat(T, color));
}

function buildRocket(T) {
  const g = new T.Group();
  const body = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 0.5, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }));
  body.position.y = 0.05;
  const interstage = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.04, 16), mat(T, 0x222222));
  interstage.position.y = 0.3;
  const upper = new T.Mesh(new T.CylinderGeometry(0.10, 0.12, 0.2, 16), mat(T, 0xDDDDDD, { roughness: 0.2 }));
  upper.position.y = 0.44;
  const nose = new T.Mesh(new T.ConeGeometry(0.10, 0.18, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }));
  nose.position.y = 0.65;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const nozzle = new T.Mesh(new T.CylinderGeometry(0.02, 0.025, 0.03, 8), mat(T, 0x444444, { metalness: 0.5 }));
      nozzle.position.set((col - 1) * 0.07, -0.2, (row - 1) * 0.07);
      g.add(nozzle);
    }
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new T.Mesh(new T.BoxGeometry(0.02, 0.12, 0.04), mat(T, 0x555555, { metalness: 0.3 }));
    leg.position.set(Math.cos(angle) * 0.14, -0.1, Math.sin(angle) * 0.14);
    leg.rotation.y = -angle;
    g.add(leg);
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const fin = new T.Mesh(new T.BoxGeometry(0.04, 0.06, 0.02), mat(T, 0x333333, { metalness: 0.3 }));
    fin.position.set(Math.cos(angle) * 0.13, 0.2, Math.sin(angle) * 0.13);
    fin.rotation.y = -angle;
    g.add(fin);
  }
  return g;
}

function buildTelescope(T) {
  const g = new T.Group();
  const tube = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.5, 16), mat(T, 0x1a3a6a, { roughness: 0.3 }));
  tube.rotation.x = Math.PI / 2;
  const hood = new T.Mesh(new T.CylinderGeometry(0.19, 0.16, 0.06, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }));
  hood.position.z = 0.27;
  hood.rotation.x = Math.PI / 2;
  const finder = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.08, 8), mat(T, 0x222222));
  finder.position.set(0, 0.18, 0.05);
  finder.rotation.x = Math.PI / 2;
  const finderEnd = new T.Mesh(new T.SphereGeometry(0.03, 6, 6), mat(T, 0x444444));
  finderEnd.position.set(0, 0.18, 0.1);
  const starSense = new T.Mesh(new T.BoxGeometry(0.06, 0.04, 0.06), mat(T, 0x333333, { metalness: 0.4 }));
  starSense.position.set(0.12, -0.06, -0.1);
  const focuser = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 0.06, 8), mat(T, 0x888888, { metalness: 0.4 }));
  focuser.position.set(0, -0.14, -0.22);
  focuser.rotation.x = Math.PI / 4;
  const eyepiece = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 0.04, 8), mat(T, 0x555555, { metalness: 0.3 }));
  eyepiece.position.set(0, -0.14, -0.27);
  eyepiece.rotation.x = Math.PI / 4;
  const mountBase = new T.Mesh(new T.CylinderGeometry(0.06, 0.08, 0.1, 10), mat(T, 0x222222, { metalness: 0.3 }));
  mountBase.position.y = -0.3;
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const leg = new T.Mesh(new T.CylinderGeometry(0.015, 0.02, 0.35, 6), mat(T, 0x888888, { metalness: 0.4 }));
    leg.position.set(Math.cos(angle) * 0.12, -0.5, Math.sin(angle) * 0.12);
    leg.rotation.z = Math.cos(angle) * 0.25;
    leg.rotation.x = Math.sin(angle) * 0.25;
    g.add(leg);
  }
  const tray = new T.Mesh(new T.TorusGeometry(0.15, 0.015, 6, 12), mat(T, 0x444444, { metalness: 0.3 }));
  tray.position.y = -0.4;
  tray.rotation.x = Math.PI / 2;
  g.add(tube, hood, finder, finderEnd, starSense, focuser, eyepiece, mountBase, tray);
  tube.position.set(0, 0, 0);
  return g;
}

function buildScience(T, id, color) {
  switch (id) {
    case 'planet': {
      const g = new T.Group();
      const sphere = new T.Mesh(new T.SphereGeometry(0.35, 24, 24), mat(T, color));
      const ring = new T.Mesh(new T.TorusGeometry(0.52, 0.06, 12, 24), mat(T, 0xE67E22, { roughness: 0.6 }));
      ring.rotation.x = 0.4;
      ring.rotation.z = 0.3;
      g.add(sphere, ring);
      return g;
    }
    case 'rocket': return buildRocket(T);
    case 'atom': {
      const g = new T.Group();
      const core = new T.Mesh(new T.SphereGeometry(0.15, 16, 16), mat(T, color, { emissive: color, emissiveIntensity: 0.3 }));
      const orbit1 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(T, 0x3498DB));
      orbit1.rotation.x = Math.PI / 2;
      const orbit2 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(T, 0x2ECC71));
      orbit2.rotation.z = Math.PI / 2;
      const orbit3 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(T, 0xE74C3C));
      orbit3.rotation.x = Math.PI / 4;
      orbit3.rotation.z = Math.PI / 4;
      const e1 = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      const e2 = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      g.add(core, orbit1, orbit2, orbit3, e1, e2);
      g.userData.atomElectrons = { e1, e2, angle: 0 };
      return g;
    }
    case 'lightbulb': {
      const g = new T.Group();
      const bulb = new T.Mesh(new T.SphereGeometry(0.3, 20, 20), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.2 }));
      bulb.scale.set(1, 1.1, 1);
      bulb.position.y = 0.2;
      const base = new T.Mesh(new T.CylinderGeometry(0.15, 0.2, 0.15, 12), mat(T, 0x7F8C8D, { metalness: 0.3 }));
      base.position.y = -0.15;
      const tip = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), mat(T, 0x7F8C8D, { metalness: 0.3 }));
      tip.position.y = -0.25;
      g.add(bulb, base, tip);
      return g;
    }
    case 'testtube': {
      const g = new T.Group();
      const tube = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.5, 12), mat(T, 0xBDC3C7, { transparent: true, opacity: 0.4, roughness: 0.1 }));
      tube.position.y = 0.1;
      const liquid = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.25, 12), mat(T, 0x2ECC71, { transparent: true, opacity: 0.7 }));
      liquid.position.y = -0.05;
      const bottom = new T.Mesh(new T.SphereGeometry(0.12, 12, 12), mat(T, 0xBDC3C7, { transparent: true, opacity: 0.4, roughness: 0.1 }));
      bottom.position.y = -0.15;
      g.add(tube, liquid, bottom);
      return g;
    }
    case 'prism': {
      const shape = new T.Shape();
      const s = 0.3;
      shape.moveTo(0, -s);
      shape.lineTo(s * 0.87, s * 0.5);
      shape.lineTo(-s * 0.87, s * 0.5);
      shape.closePath();
      const geo = new T.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
      const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.2 }));
      mesh.rotation.x = -0.2;
      return mesh;
    }
    case 'globe': {
      const g = new T.Group();
      const sphere = new T.Mesh(new T.SphereGeometry(0.3, 24, 24), mat(T, 0x3498DB, { roughness: 0.3 }));
      sphere.material.map = createGlobeTexture();
      sphere.material.needsUpdate = true;
      const stand = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.3, 8), mat(T, 0x7F8C8D, { metalness: 0.3 }));
      stand.position.y = -0.4;
      const base = new T.Mesh(new T.ConeGeometry(0.15, 0.06, 12), mat(T, 0x7F8C8D, { metalness: 0.3 }));
      base.position.y = -0.55;
      g.add(sphere, stand, base);
      return g;
    }
    case 'telescope': return buildTelescope(T);
    case 'satellite': {
      const g = new T.Group();
      const body = new T.Mesh(new T.BoxGeometry(0.25, 0.2, 0.25), mat(T, 0xBDC3C7, { metalness: 0.3 }));
      const panel1 = new T.Mesh(new T.BoxGeometry(0.5, 0.02, 0.15), mat(T, 0x3498DB));
      panel1.position.x = 0.4;
      const panel2 = new T.Mesh(new T.BoxGeometry(0.5, 0.02, 0.15), mat(T, 0x3498DB));
      panel2.position.x = -0.4;
      const antenna = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.2, 6), mat(T, 0xF1C40F));
      antenna.position.y = 0.2;
      const tip = new T.Mesh(new T.SphereGeometry(0.03, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      tip.position.y = 0.3;
      g.add(body, panel1, panel2, antenna, tip);
      return g;
    }
    default: return null;
  }
}

const objectDefs = [
  { id: 'sphere', nameEn: 'Ball', nameId: 'Bola', emoji: '⚽', type: 'geo' },
  { id: 'box', nameEn: 'Cube', nameId: 'Kubus', emoji: '🧊', type: 'geo' },
  { id: 'cylinder', nameEn: 'Can', nameId: 'Kaleng', emoji: '🥫', type: 'geo' },
  { id: 'cone', nameEn: 'Cone', nameId: 'Kerucut', emoji: '🔺', type: 'geo' },
  { id: 'torus', nameEn: 'Doughnut', nameId: 'Donat', emoji: '🍩', type: 'geo' },
  { id: 'ring', nameEn: 'Ring', nameId: 'Cincin', emoji: '💍', type: 'geo' },
  { id: 'tetrahedron', nameEn: 'Pyramid', nameId: 'Piramida', emoji: '🔺', type: 'geo' },
  { id: 'octahedron', nameEn: 'Diamond', nameId: 'Berlian', emoji: '💎', type: 'geo' },
  { id: 'dodecahedron', nameEn: 'Gem', nameId: 'Permata', emoji: '💠', type: 'geo' },
  { id: 'torusknot', nameEn: 'Knot', nameId: 'Simpul', emoji: '🎀', type: 'geo' },
  { id: 'icosahedron', nameEn: 'Crystal', nameId: 'Kristal', emoji: '🔮', type: 'geo' },
  { id: 'planet', nameEn: 'Planet', nameId: 'Planet', emoji: '🪐', type: 'science' },
  { id: 'rocket', nameEn: 'Rocket', nameId: 'Roket', emoji: '🚀', type: 'science' },
  { id: 'atom', nameEn: 'Atom', nameId: 'Atom', emoji: '⚛️', type: 'science' },
  { id: 'lightbulb', nameEn: 'Lightbulb', nameId: 'Bola Lampu', emoji: '💡', type: 'science' },
  { id: 'testtube', nameEn: 'Test Tube', nameId: 'Tabung Reaksi', emoji: '🧪', type: 'science' },
  { id: 'prism', nameEn: 'Prism', nameId: 'Prisma', emoji: '🔷', type: 'science' },
  { id: 'globe', nameEn: 'Globe', nameId: 'Globe', emoji: '🌍', type: 'science' },
  { id: 'telescope', nameEn: 'Telescope', nameId: 'Teleskop', emoji: '🔭', type: 'science' },
  { id: 'satellite', nameEn: 'Satellite', nameId: 'Satelit', emoji: '🛰️', type: 'science' },
];

function createObj(id, color) {
  const def = objectDefs.find(d => d.id === id);
  if (!def) return null;
  const T = THREE;
  let mesh = def.type === 'geo' ? buildGeometric(T, id, color) : buildScience(T, id, color);
  return mesh || null;
}

function createGradientTexture() {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0a0a2a');
  grad.addColorStop(0.3, '#1a1a5e');
  grad.addColorStop(0.6, '#2d1b69');
  grad.addColorStop(0.85, '#e8738a');
  grad.addColorStop(1, '#fce4b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  return new THREE.CanvasTexture(c);
}

function createParticles(T) {
  const count = 300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 10 + Math.random() * 15;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.5 + 2;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  const mat = new T.PointsMaterial({
    color: 0xffffff, size: 0.06, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  return new T.Points(geo, mat);
}

function createCloud(T, x, y, z) {
  const g = new T.Group();
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const s = new T.Mesh(
      new T.SphereGeometry(0.3 + Math.random() * 0.4, 8, 8),
      new T.MeshStandardMaterial({
        color: 0xffffff, transparent: true, opacity: 0.15 + Math.random() * 0.15,
        roughness: 1, metalness: 0, depthWrite: false,
      })
    );
    s.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
    s.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    g.add(s);
  }
  g.position.set(x, y, z);
  g.userData.cloudSpeed = 0.02 + Math.random() * 0.04;
  return g;
}

function disposeObject(group) {
  if (!group) return;
  group.traverse(child => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map = null;
        child.material.dispose();
      }
    }
  });
}

function showObject(index, animate = true) {
  if (index < 0 || index >= objectDefs.length) return;
  const def = objectDefs[index];
  const color = COLORS[index % COLORS.length];
  const mesh = createObj(def.id, color);
  if (!mesh) return;

  if (currentGroup) {
    scene.remove(currentGroup);
    disposeObject(currentGroup);
  }

  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(0, 0.3, 0);

  if (def.type === 'science' && def.id !== 'telescope') {
    group.scale.setScalar(0.8);
  }
  if (def.id === 'telescope') {
    group.scale.setScalar(0.85);
  }

  if (def.id === 'rocket') {
    group.rotation.x = 0;
    group.rotation.y = 0;
  } else if (def.id === 'telescope') {
    group.rotation.x = 0;
    group.rotation.y = -0.3;
  } else {
    group.rotation.x = 0.1;
    group.rotation.y = 0.3;
  }

  group.userData = {
    id: def.id, nameEn: def.nameEn, nameId: def.nameId, emoji: def.emoji,
  };

  currentGroup = group;
  currentObjectIndex = index;

  if (animate) {
    group.scale.set(0, 0, 0);
    scene.add(group);
    fadeInGroup(group);
  } else {
    scene.add(group);
  }

  updateEmojiSelection();
  updateLangToggleActive();
}

function fadeInGroup(group) {
  const start = clock.getElapsedTime();
  const duration = 0.35;
  function tick() {
    const t = Math.min((clock.getElapsedTime() - start) / duration, 1);
    group.scale.setScalar(t * t * (3 - 2 * t));
    if (t < 1) requestAnimationFrame(tick);
  }
  tick();
}

function updateEmojiBar() {
  for (let i = 0; i < VISIBLE_EMOJIS; i++) {
    const btn = document.getElementById('emoji-' + i);
    const idx = emojiStartIndex + i;
    if (idx < objectDefs.length) {
      const def = objectDefs[idx];
      btn.textContent = def.emoji;
      btn.style.display = 'flex';
      btn.dataset.index = idx;
    } else {
      btn.style.display = 'none';
      btn.dataset.index = -1;
    }
  }
  updateEmojiSelection();
}

function updateEmojiSelection() {
  for (let i = 0; i < VISIBLE_EMOJIS; i++) {
    const btn = document.getElementById('emoji-' + i);
    const idx = parseInt(btn.dataset.index, 10);
    btn.classList.toggle('active', idx === currentObjectIndex);
  }
}

function updateLangToggleActive() {
  const btnEn = document.getElementById('lang-en');
  const btnId = document.getElementById('lang-id');
  btnEn.classList.toggle('active', currentLang === 'en');
  btnId.classList.toggle('active', currentLang === 'id');
}

function init() {
  const container = document.getElementById('game-container');

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);
  camera.lookAt(0, 0.3, 0);

  scene = new THREE.Scene();
  scene.background = createGradientTexture();
  scene.fog = new THREE.FogExp2(0x0a0a2a, 0.015);

  clock = new THREE.Clock();

  const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffeedd, 1.8);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-3, 2, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffddff, 0.3);
  rimLight.position.set(0, -2, -5);
  scene.add(rimLight);

  scene.add(createParticles(THREE));

  const cloudPositions = [[-4, 4, -6], [3, 4.5, -7], [0, 5, -8], [-5, 3, -9], [5, 3.5, -5]];
  cloudPositions.forEach(([x, y, z]) => scene.add(createCloud(THREE, x, y, z)));

  const randomIndex = Math.floor(Math.random() * objectDefs.length);
  showObject(randomIndex, false);
  emojiStartIndex = Math.min(Math.max(randomIndex - 1, 0), objectDefs.length - VISIBLE_EMOJIS);
  updateEmojiBar();

  setupInteraction();
  setupUI();

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  animate();
}

function setupInteraction() {
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';

  function onPointerDown(e) {
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isDragging = false;
    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!e.buttons) return;
    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDragging = true;
    }
    if (currentGroup && isDragging) {
      currentGroup.rotation.y += dx * 0.018;
      currentGroup.rotation.x += dy * 0.018;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    }
  }

  function onPointerUp(e) {
    canvas.releasePointerCapture(e.pointerId);
    if (!isDragging && currentGroup) {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(nx, ny);
      raycaster.setFromCamera(pointer, camera);
      const meshes = [];
      currentGroup.traverse(node => { if (node.isMesh) meshes.push(node); });
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        onObjectTap(currentGroup);
      }
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
}

function onObjectTap(group) {
  if (!audioReady) {
    unlockAudio();
    audioReady = true;
  }
  if (soundOn) AudioSynth.ding();
  const data = group.userData;
  const name = currentLang === 'en' ? data.nameEn : data.nameId;
  speak(name, currentLang === 'en' ? 'en-US' : 'id-ID');
}

function setupUI() {
  const backBtn = document.getElementById('back-btn');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const helpClose = document.getElementById('help-close');
  const soundToggle = document.getElementById('sound-toggle');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const mathModal = document.getElementById('math-modal');
  const mathQuestion = document.getElementById('math-question');
  const mathAnswer = document.getElementById('math-answer');
  const mathSubmit = document.getElementById('math-submit');
  const mathCancel = document.getElementById('math-cancel');
  const btnEn = document.getElementById('lang-en');
  const btnId = document.getElementById('lang-id');
  const prevBtn = document.getElementById('emoji-prev');
  const nextBtn = document.getElementById('emoji-next');

  let mathA = 0, mathB = 0, mathSum = 0;
  let pendingAction = null;

  function showMathGate(action) {
    mathA = Math.floor(Math.random() * 8) + 1;
    mathB = Math.floor(Math.random() * 8) + 1;
    mathSum = mathA + mathB;
    pendingAction = action;
    mathQuestion.textContent = mathA + ' + ' + mathB + ' = ?';
    mathAnswer.value = '';
    mathModal.classList.add('visible');
    setTimeout(() => mathAnswer.focus(), 100);
  }

  function hideMathGate() {
    mathModal.classList.remove('visible');
    pendingAction = null;
  }

  function switchLang(lang) {
    currentLang = lang;
    speak(lang === 'en' ? 'English' : 'Bahasa Indonesia', lang === 'en' ? 'en-US' : 'id-ID');
    updateLangToggleActive();
  }

  function scrollEmoji(direction) {
    const maxStart = objectDefs.length - VISIBLE_EMOJIS;
    emojiStartIndex = Math.max(0, Math.min(maxStart, emojiStartIndex + direction));
    updateEmojiBar();
  }

  function selectEmoji(index) {
    if (index >= 0 && index < objectDefs.length) {
      showObject(index, true);
    }
  }

  mathSubmit.addEventListener('click', (e) => {
    e.stopPropagation();
    const val = parseInt(mathAnswer.value, 10);
    if (val === mathSum && pendingAction) pendingAction();
    hideMathGate();
  });

  mathCancel.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMathGate();
  });

  mathAnswer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = parseInt(mathAnswer.value, 10);
      if (val === mathSum && pendingAction) pendingAction();
      hideMathGate();
    }
  });

  soundToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundOn = !soundOn;
    const use = soundToggle.querySelector('use');
    use.setAttribute('href', soundOn ? '../../assets/svg/icons.svg#icon-sound-on' : '../../assets/svg/icons.svg#icon-sound-off');
  });

  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showMathGate(() => { window.location.href = '../../index.html'; });
  });

  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showMathGate(() => { helpModal.classList.add('visible'); });
  });

  helpClose.addEventListener('click', (e) => {
    e.stopPropagation();
    helpModal.classList.remove('visible');
  });

  btnEn.addEventListener('click', (e) => {
    e.stopPropagation();
    showMathGate(() => switchLang('en'));
  });

  btnId.addEventListener('click', (e) => {
    e.stopPropagation();
    showMathGate(() => switchLang('id'));
  });

  prevBtn.addEventListener('click', () => scrollEmoji(-1));
  nextBtn.addEventListener('click', () => scrollEmoji(1));

  for (let i = 0; i < VISIBLE_EMOJIS; i++) {
    document.getElementById('emoji-' + i).addEventListener('click', function() {
      const idx = parseInt(this.dataset.index, 10);
      if (idx >= 0) selectEmoji(idx);
    });
  }

  updateLangToggleActive();
}

function animate() {
  requestAnimationFrame(animate);
  if (currentGroup) {
    const data = currentGroup.userData;
    if (data && data.id === 'atom') {
      const atomData = currentGroup.userData.atomElectrons;
      if (atomData) {
        atomData.angle += 0.02;
        const r = 0.3;
        atomData.e1.position.set(Math.cos(atomData.angle) * r, Math.sin(atomData.angle) * r, 0);
        atomData.e2.position.set(0, Math.cos(atomData.angle + Math.PI) * r, Math.sin(atomData.angle + Math.PI) * r);
      }
    }
  }
  scene.children.forEach(child => {
    if (child.type === 'Group' && child.userData.cloudSpeed) {
      child.position.x += child.userData.cloudSpeed * 0.3;
      if (child.position.x > 10) child.position.x = -10;
    }
  });
  renderer.render(scene, camera);
}

init();
