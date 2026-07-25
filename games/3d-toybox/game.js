import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
import { unlockAudio, AudioSynth } from '../../js/audio.js';
import { speak } from '../../js/speech.js';
import * as Models from './models.js';

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

const factoryMap = {
  sphere: 'createSphere', box: 'createBox', cylinder: 'createCylinder',
  cone: 'createCone', torus: 'createTorus', ring: 'createRing',
  tetrahedron: 'createTetrahedron', octahedron: 'createOctahedron',
  dodecahedron: 'createDodecahedron', torusknot: 'createTorusKnot',
  icosahedron: 'createIcosahedron', planet: 'createPlanet', rocket: 'createRocket',
  atom: 'createAtom', lightbulb: 'createLightbulb', testtube: 'createTesttube',
  prism: 'createPrism', globe: 'createGlobe', telescope: 'createTelescope',
  satellite: 'createSatellite',
};

function createObj(id, color) {
  const fn = factoryMap[id];
  if (!fn || typeof Models[fn] !== 'function') return null;
  return Models[fn](THREE, color);
}

function setObjUserData(group, def) {
  const atomData = group.userData.atomElectrons;
  group.userData = {
    id: def.id, nameEn: def.nameEn, nameId: def.nameId, emoji: def.emoji,
  };
  if (atomData) group.userData.atomElectrons = atomData;
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
  const group = createObj(def.id, color);
  if (!group) return;

  if (currentGroup) {
    scene.remove(currentGroup);
    disposeObject(currentGroup);
  }

  group.position.set(0, 0.3, 0);

  if (def.type === 'science' && def.id !== 'telescope') {
    group.scale.setScalar(0.8);
  }
  if (def.id === 'telescope') {
    group.scale.setScalar(0.85);
  }

  group.rotation.x = 0.1;
  group.rotation.y = 0.3;

  setObjUserData(group, def);

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

let isPointerDown = false;

function setupInteraction() {
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  canvas.style.touchCallout = 'none';
  canvas.style.webkitTouchCallout = 'none';

  function onPointerDown(e) {
    isPointerDown = true;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isDragging = false;
    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    if (dx !== 0 || dy !== 0) {
      isDragging = true;
    }
    if (currentGroup && isDragging) {
      currentGroup.rotation.y += dx * 0.045;
      currentGroup.rotation.x += dy * 0.045;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    }
  }

  function onPointerUp(e) {
    isPointerDown = false;
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

window.addEventListener('unhandledrejection', e => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:40px;left:0;right:0;background:darkred;color:white;padding:12px;z-index:9999;font-size:14px;word-break:break-all';
  el.textContent = 'REJECTION: ' + (e.reason?.message || e.reason || 'Unknown');
  document.body.prepend(el);
});

window.addEventListener('error', e => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:12px;z-index:9999;font-size:14px;word-break:break-all';
  el.textContent = e.message || 'Unknown error';
  document.body.prepend(el);
});

init();
