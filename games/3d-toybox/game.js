import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
import { unlockAudio, AudioSynth } from '../../js/audio.js';
import { speak } from '../../js/speech.js';

const COLORS = [
  0xE74C3C, 0x3498DB, 0xF1C40F, 0x2ECC71, 0xE67E22,
  0x9B59B6, 0xFF6B9D, 0x1ABC9C, 0xF39C12, 0x2980B9,
  0x8E44AD, 0x27AE60, 0xD35400, 0x16A085, 0xC0392B,
  0x7FB3D8, 0xF7DC6F, 0x82E0AA, 0xF1948A, 0xBB8FCE,
];

let currentLang = 'id';
let audioReady = false;
let soundOn = true;

const tapEffects = [];
const sceneObjects = [];
const clock = new THREE.Clock();

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
  };
  const params = geoMap[id];
  if (!params) return null;
  const [ctor, ...args] = params;
  const mat = new T.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.15,
  });
  const mesh = new T.Mesh(new ctor(...args), mat);
  return mesh;
}

function buildScience(T, id, color) {
  const mat = (c, opts = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.15, ...opts });

  switch (id) {
    case 'planet': {
      const g = new T.Group();
      const sphere = new T.Mesh(new T.SphereGeometry(0.35, 24, 24), mat(color));
      const ring = new T.Mesh(new T.TorusGeometry(0.52, 0.06, 12, 24), mat(0xE67E22, { roughness: 0.6 }));
      ring.rotation.x = 0.4;
      ring.rotation.z = 0.3;
      g.add(sphere);
      g.add(ring);
      return g;
    }
    case 'rocket': {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(0.25, 0.3, 0.6, 12), mat(0xE74C3C));
      body.position.y = 0.1;
      const nose = new T.Mesh(new T.ConeGeometry(0.25, 0.25, 12), mat(0xF1C40F));
      nose.position.y = 0.5;
      const fin1 = new T.Mesh(new T.BoxGeometry(0.05, 0.15, 0.2), mat(0xF1C40F));
      fin1.position.set(-0.25, -0.1, 0);
      fin1.rotation.z = 0.3;
      const fin2 = new T.Mesh(new T.BoxGeometry(0.05, 0.15, 0.2), mat(0xF1C40F));
      fin2.position.set(0.25, -0.1, 0);
      fin2.rotation.z = -0.3;
      const flame = new T.Mesh(new T.ConeGeometry(0.15, 0.15, 8), mat(0xFF6B9D, { emissive: 0xFF6B9D, emissiveIntensity: 0.5 }));
      flame.position.y = -0.35;
      g.add(body, nose, fin1, fin2, flame);
      return g;
    }
    case 'atom': {
      const g = new T.Group();
      const core = new T.Mesh(new T.SphereGeometry(0.15, 16, 16), mat(color, { emissive: color, emissiveIntensity: 0.3 }));
      const orbit1 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(0x3498DB));
      orbit1.rotation.x = Math.PI / 2;
      const orbit2 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(0x2ECC71));
      orbit2.rotation.z = Math.PI / 2;
      const orbit3 = new T.Mesh(new T.TorusGeometry(0.3, 0.025, 8, 16), mat(0xE74C3C));
      orbit3.rotation.x = Math.PI / 4;
      orbit3.rotation.z = Math.PI / 4;
      const e1 = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), mat(0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      const e2 = new T.Mesh(new T.SphereGeometry(0.06, 8, 8), mat(0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      g.add(core, orbit1, orbit2, orbit3, e1, e2);
      g.userData.atomElectrons = { e1, e2, angle: 0 };
      return g;
    }
    case 'lightbulb': {
      const g = new T.Group();
      const bulb = new T.Mesh(new T.SphereGeometry(0.3, 20, 20), mat(0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.2 }));
      bulb.scale.set(1, 1.1, 1);
      bulb.position.y = 0.2;
      const base = new T.Mesh(new T.CylinderGeometry(0.15, 0.2, 0.15, 12), mat(0x7F8C8D, { metalness: 0.3 }));
      base.position.y = -0.15;
      const tip = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), mat(0x7F8C8D, { metalness: 0.3 }));
      tip.position.y = -0.25;
      g.add(bulb, base, tip);
      return g;
    }
    case 'testtube': {
      const g = new T.Group();
      const tube = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.5, 12), mat(0xBDC3C7, { transparent: true, opacity: 0.4, roughness: 0.1 }));
      tube.position.y = 0.1;
      const liquid = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.25, 12), mat(0x2ECC71, { transparent: true, opacity: 0.7 }));
      liquid.position.y = -0.05;
      const bottom = new T.Mesh(new T.SphereGeometry(0.12, 12, 12), mat(0xBDC3C7, { transparent: true, opacity: 0.4, roughness: 0.1 }));
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
      const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 };
      const geo = new T.ExtrudeGeometry(shape, extrudeSettings);
      const g = new T.Mesh(geo, mat(color, { roughness: 0.2 }));
      g.rotation.x = -0.2;
      return g;
    }
    case 'globe': {
      const g = new T.Group();
      const earth = new T.Mesh(new T.SphereGeometry(0.3, 20, 20), mat(0x3498DB, { roughness: 0.3 }));
      const land = new T.Mesh(new T.SphereGeometry(0.31, 20, 20), mat(0x2ECC71, { transparent: true, opacity: 0.3 }));
      const stand = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.3, 8), mat(0x7F8C8D, { metalness: 0.3 }));
      stand.position.y = -0.4;
      const base = new T.Mesh(new T.ConeGeometry(0.15, 0.06, 12), mat(0x7F8C8D, { metalness: 0.3 }));
      base.position.y = -0.55;
      g.add(earth, land, stand, base);
      return g;
    }
    case 'telescope': {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(0.1, 0.15, 0.5, 12), mat(0xE67E22));
      body.rotation.x = Math.PI / 2.5;
      body.position.set(0, 0.1, 0.2);
      const eyepiece = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, 0.08, 8), mat(0x34495E));
      eyepiece.rotation.x = Math.PI / 2.5;
      eyepiece.position.set(0, 0.1, 0.5);
      for (let i = 0; i < 3; i++) {
        const leg = new T.Mesh(new T.CylinderGeometry(0.02, 0.03, 0.4, 6), mat(0x7F8C8D, { metalness: 0.3 }));
        const angle = (i / 3) * Math.PI * 2;
        leg.position.set(Math.cos(angle) * 0.2, -0.15, Math.sin(angle) * 0.2);
        leg.rotation.z = Math.cos(angle) * 0.3;
        leg.rotation.x = Math.sin(angle) * 0.3;
        g.add(leg);
      }
      g.add(body, eyepiece);
      return g;
    }
    case 'satellite': {
      const g = new T.Group();
      const body = new T.Mesh(new T.BoxGeometry(0.25, 0.2, 0.25), mat(0xBDC3C7, { metalness: 0.3 }));
      const panel1 = new T.Mesh(new T.BoxGeometry(0.5, 0.02, 0.15), mat(0x3498DB));
      panel1.position.x = 0.4;
      const panel2 = new T.Mesh(new T.BoxGeometry(0.5, 0.02, 0.15), mat(0x3498DB));
      panel2.position.x = -0.4;
      const antenna = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.2, 6), mat(0xF1C40F));
      antenna.position.y = 0.2;
      const tip = new T.Mesh(new T.SphereGeometry(0.03, 8, 8), mat(0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }));
      tip.position.y = 0.3;
      g.add(body, panel1, panel2, antenna, tip);
      return g;
    }
    case 'rainbow': {
      const g = new T.Group();
      const rainbowColors = [0xE74C3C, 0xE67E22, 0xF1C40F, 0x2ECC71, 0x3498DB, 0x9B59B6];
      rainbowColors.forEach((c, i) => {
        const arc = new T.Mesh(
          new T.TorusGeometry(0.25 + i * 0.08, 0.025, 6, 16, Math.PI),
          mat(c, { roughness: 0.2 })
        );
        arc.rotation.x = -Math.PI / 2;
        arc.position.y = i * 0.06;
        g.add(arc);
      });
      return g;
    }
    default:
      return null;
  }
}

const GEOMETRIC_DEFS = [
  { id: 'sphere', nameEn: 'Ball', nameId: 'Bola', emoji: '⚽' },
  { id: 'box', nameEn: 'Cube', nameId: 'Kubus', emoji: '🧊' },
  { id: 'cylinder', nameEn: 'Can', nameId: 'Kaleng', emoji: '🥫' },
  { id: 'cone', nameEn: 'Cone', nameId: 'Kerucut', emoji: '🔺' },
  { id: 'torus', nameEn: 'Doughnut', nameId: 'Donat', emoji: '🍩' },
  { id: 'ring', nameEn: 'Ring', nameId: 'Cincin', emoji: '💍' },
  { id: 'tetrahedron', nameEn: 'Pyramid', nameId: 'Piramida', emoji: '🔺' },
  { id: 'octahedron', nameEn: 'Diamond', nameId: 'Berlian', emoji: '💎' },
  { id: 'dodecahedron', nameEn: 'Gem', nameId: 'Permata', emoji: '💠' },
  { id: 'torusknot', nameEn: 'Knot', nameId: 'Simpul', emoji: '🎀' },
];

const SCIENCE_DEFS = [
  { id: 'planet', nameEn: 'Planet', nameId: 'Planet', emoji: '🪐' },
  { id: 'rocket', nameEn: 'Rocket', nameId: 'Roket', emoji: '🚀' },
  { id: 'atom', nameEn: 'Atom', nameId: 'Atom', emoji: '⚛️' },
  { id: 'lightbulb', nameEn: 'Lightbulb', nameId: 'Bola Lampu', emoji: '💡' },
  { id: 'testtube', nameEn: 'Test Tube', nameId: 'Tabung Reaksi', emoji: '🧪' },
  { id: 'prism', nameEn: 'Prism', nameId: 'Prisma', emoji: '🔷' },
  { id: 'globe', nameEn: 'Globe', nameId: 'Globe', emoji: '🌍' },
  { id: 'telescope', nameEn: 'Telescope', nameId: 'Teleskop', emoji: '🔭' },
  { id: 'satellite', nameEn: 'Satellite', nameId: 'Satelit', emoji: '🛰️' },
  { id: 'rainbow', nameEn: 'Rainbow', nameId: 'Pelangi', emoji: '🌈' },
];

let renderer, scene, camera, raycaster, pointer;

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
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 10 + Math.random() * 15;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.5 + 2;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 0.05 + Math.random() * 0.1;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  geo.setAttribute('size', new T.BufferAttribute(sizes, 1));
  const mat = new T.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
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
        color: 0xffffff,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.15,
        roughness: 1,
        metalness: 0,
        depthWrite: false,
      })
    );
    s.position.set(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    s.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    g.add(s);
  }
  g.position.set(x, y, z);
  g.userData.cloudSpeed = 0.02 + Math.random() * 0.04;
  return g;
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

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 2.5, 7);
  camera.lookAt(0, 0.5, 0);

  scene = new THREE.Scene();
  scene.background = createGradientTexture();
  scene.fog = new THREE.FogExp2(0x0a0a2a, 0.015);

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

  const cloudPositions = [
    [-4, 4, -6], [3, 4.5, -7], [0, 5, -8], [-5, 3, -9], [5, 3.5, -5],
  ];
  cloudPositions.forEach(([x, y, z]) => {
    scene.add(createCloud(THREE, x, y, z));
  });

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const allDefs = [
    ...GEOMETRIC_DEFS.map(d => ({ ...d, type: 'geo' })),
    ...SCIENCE_DEFS.map(d => ({ ...d, type: 'science' })),
  ];

  allDefs.forEach((def, i) => {
    const color = COLORS[i % COLORS.length];
    let mesh;
    if (def.type === 'geo') {
      mesh = buildGeometric(THREE, def.id, color);
    } else {
      mesh = buildScience(THREE, def.id, color);
    }
    if (!mesh) return;

    const group = new THREE.Group();
    group.add(mesh);

    if (def.type === 'science') {
      group.scale.setScalar(0.7);
    }

    const angle = (i / allDefs.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const elevation = Math.sin(i * 0.8) * 0.35 + 0.1;
    const dist = 3.2 + Math.sin(i * 1.3) * 0.8;

    group.position.x = dist * Math.cos(angle) * Math.cos(elevation);
    group.position.y = dist * Math.sin(elevation) + 1.2 + Math.random() * 0.3;
    group.position.z = -dist * Math.sin(angle) * Math.cos(elevation);

    group.userData = {
      id: def.id,
      nameEn: def.nameEn,
      nameId: def.nameId,
      emoji: def.emoji,
      phase: i * 1.5,
      rotSpeed: { x: 0.3 + Math.random() * 0.3, y: 0.5 + Math.random() * 0.5 },
      bobSpeed: 0.5 + Math.random() * 0.4,
      bobAmount: 0.1 + Math.random() * 0.1,
      baseY: group.position.y,
      tapped: false,
      tapTime: 0,
    };

    scene.add(group);
    sceneObjects.push(group);
  });

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

  function getPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    return {
      x: ((x - rect.left) / rect.width) * 2 - 1,
      y: -((y - rect.top) / rect.height) * 2 + 1,
    };
  }

  function handleTap(e) {
    const pos = getPointer(e);
    pointer.set(pos.x, pos.y);
    raycaster.setFromCamera(pointer, camera);

    const meshes = [];
    sceneObjects.forEach(group => {
      group.children.forEach(child => {
        child.userData.parentGroup = group;
      });
      const descendants = [];
      group.traverse(node => {
        if (node.isMesh) descendants.push(node);
      });
      meshes.push(...descendants);
    });

    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      let targetGroup = hit.userData.parentGroup || hit.parent;
      if (!sceneObjects.includes(targetGroup)) {
        targetGroup = targetGroup.parent;
      }
      if (targetGroup && sceneObjects.includes(targetGroup)) {
        onObjectTap(targetGroup);
      }
    }
  }

  canvas.addEventListener('pointerdown', handleTap);
}

function onObjectTap(group) {
  if (!audioReady) {
    unlockAudio();
    audioReady = true;
  }
  if (soundOn) {
    AudioSynth.ding();
  }

  const data = group.userData;
  const name = currentLang === 'en' ? data.nameEn : data.nameId;
  speak(name, currentLang === 'en' ? 'en-US' : 'id-ID');

  data.tapped = true;
  data.tapTime = clock.getElapsedTime();

  tapEffects.push({
    group,
    startTime: clock.getElapsedTime(),
    duration: 0.6,
  });
}

function setupUI() {
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
  const btnEn = document.getElementById('lang-en');
  const btnId = document.getElementById('lang-id');

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

  function switchLang(lang) {
    currentLang = lang;
    speak(lang === 'en' ? 'English' : 'Bahasa Indonesia', lang === 'en' ? 'en-US' : 'id-ID');
  }

  mathSubmit.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const val = parseInt(mathAnswer.value, 10);
    if (val === mathSum && pendingAction) pendingAction();
    hideMathGate();
  });

  mathCancel.addEventListener('pointerdown', (e) => {
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

  soundToggle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    soundOn = !soundOn;
    const use = soundToggle.querySelector('use');
    use.setAttribute('href',
      soundOn ? '../../assets/svg/icons.svg#icon-sound-on' : '../../assets/svg/icons.svg#icon-sound-off'
    );
  });

  fullscreenBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  backBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    showMathGate(() => {
      window.location.href = '../../index.html';
    });
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

  btnEn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    showMathGate(() => switchLang('en'));
  });

  btnId.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    showMathGate(() => switchLang('id'));
  });
}

function updateTapEffects(time) {
  for (let i = tapEffects.length - 1; i >= 0; i--) {
    const fx = tapEffects[i];
    const elapsed = time - fx.startTime;
    const progress = Math.min(elapsed / fx.duration, 1);

    const group = fx.group;
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.15 * (1 - progress);
    group.scale.setScalar(scale);

    const wobble = Math.sin(progress * Math.PI * 8) * 0.08 * (1 - progress);
    group.rotation.z = wobble;

    if (progress >= 1) {
      group.scale.setScalar(1);
      group.rotation.z = 0;
      tapEffects.splice(i, 1);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  sceneObjects.forEach(group => {
    const data = group.userData;
    group.rotation.x += data.rotSpeed.x * 0.008;
    group.rotation.y += data.rotSpeed.y * 0.008;

    if (!data.tapped || time - data.tapTime > 1.5) {
      const bob = Math.sin(time * data.bobSpeed + data.phase) * data.bobAmount;
      group.position.y = data.baseY + bob;
    }

    if (data.id === 'atom') {
      const atomData = group.userData.atomElectrons;
      if (atomData) {
        atomData.angle += 0.02;
        const r = 0.3;
        atomData.e1.position.set(Math.cos(atomData.angle) * r, Math.sin(atomData.angle) * r, 0);
        atomData.e2.position.set(0, Math.cos(atomData.angle + Math.PI) * r, Math.sin(atomData.angle + Math.PI) * r);
      }
    }

    if (data.id === 'satellite') {
      group.children[0].rotation.y += 0.02;
    }
  });

  scene.children.forEach(child => {
    if (child.type === 'Group' && child.userData.cloudSpeed) {
      child.position.x += child.userData.cloudSpeed * 0.3;
      if (child.position.x > 10) child.position.x = -10;
    }
  });

  updateTapEffects(time);

  renderer.render(scene, camera);
}

init();
