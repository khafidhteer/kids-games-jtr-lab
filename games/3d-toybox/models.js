function mat(T, c, opts = {}) {
  return new T.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.15, ...opts })
}

export function createSphere(T, color) {
  const g = new T.Group()
  const geo = new T.SphereGeometry(0.4, 32, 32)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.3, metalness: 0.1 }))
  g.add(mesh)
  g.userData = { id: 'sphere' }
  return g
}

export function createBox(T, color) {
  const g = new T.Group()
  const geo = new T.BoxGeometry(0.55, 0.55, 0.55, 1, 1, 1)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.4 }))
  g.add(mesh)
  const pipMat = mat(T, 0xFFFFFF, { roughness: 0.2 })
  for (let i = 0; i < 3; i++) {
    const pip = new T.Mesh(new T.SphereGeometry(0.035, 8, 8), pipMat)
    pip.position.set(0.28, (i - 1) * 0.16, 0)
    g.add(pip)
  }
  g.userData = { id: 'box' }
  return g
}

export function createCylinder(T, color) {
  const g = new T.Group()
  const geo = new T.CylinderGeometry(0.25, 0.25, 0.5, 24)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.25, metalness: 0.5 }))
  g.add(mesh)
  const ringMat = mat(T, color, { roughness: 0.3, metalness: 0.6 })
  const topRing = new T.Mesh(new T.TorusGeometry(0.25, 0.015, 8, 24), ringMat)
  topRing.position.y = 0.25
  topRing.rotation.x = Math.PI / 2
  const bottomRing = new T.Mesh(new T.TorusGeometry(0.25, 0.015, 8, 24), ringMat)
  bottomRing.position.y = -0.25
  bottomRing.rotation.x = Math.PI / 2
  g.add(topRing, bottomRing)
  g.userData = { id: 'cylinder' }
  return g
}

export function createCone(T, color) {
  const g = new T.Group()
  const geo = new T.ConeGeometry(0.3, 0.55, 24)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.5 }))
  mesh.position.y = -0.025
  g.add(mesh)
  const tip = new T.Mesh(new T.SphereGeometry(0.03, 8, 8), mat(T, color, { roughness: 0.3 }))
  tip.position.y = 0.3
  g.add(tip)
  g.userData = { id: 'cone' }
  return g
}

export function createTorus(T, color) {
  const g = new T.Group()
  const geo = new T.TorusGeometry(0.3, 0.13, 20, 32)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.6, metalness: 0 }))
  g.add(mesh)
  const sprinkleColors = [0xE74C3C, 0xF1C40F, 0x2ECC71, 0x3498DB, 0x9B59B6]
  for (let i = 0; i < 5; i++) {
    const s = new T.Mesh(new T.SphereGeometry(0.025, 8, 8), mat(T, sprinkleColors[i], { roughness: 0.4 }))
    const angle = Math.random() * Math.PI * 2
    const r = 0.22 + Math.random() * 0.1
    s.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.5 + 0.03, 0)
    g.add(s)
  }
  g.userData = { id: 'torus' }
  return g
}

export function createRing(T, color) {
  const g = new T.Group()
  const geo = new T.TorusGeometry(0.32, 0.06, 20, 32)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.3, metalness: 0.7 }))
  g.add(mesh)
  g.userData = { id: 'ring' }
  return g
}

export function createTetrahedron(T, color) {
  const g = new T.Group()
  const geo = new T.TetrahedronGeometry(0.4)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.4 }))
  g.add(mesh)
  g.userData = { id: 'tetrahedron' }
  return g
}

export function createOctahedron(T, color) {
  const g = new T.Group()
  const geo = new T.OctahedronGeometry(0.4)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.2, metalness: 0.3, emissive: color, emissiveIntensity: 0.1 }))
  g.add(mesh)
  g.userData = { id: 'octahedron' }
  return g
}

export function createDodecahedron(T, color) {
  const g = new T.Group()
  const geo = new T.DodecahedronGeometry(0.38)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.2, metalness: 0.2, emissive: color, emissiveIntensity: 0.15 }))
  g.add(mesh)
  g.userData = { id: 'dodecahedron' }
  return g
}

export function createTorusKnot(T, color) {
  const g = new T.Group()
  const geo = new T.TorusKnotGeometry(0.3, 0.1, 48, 8)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.5, metalness: 0.2 }))
  g.add(mesh)
  g.userData = { id: 'torusknot' }
  return g
}

export function createIcosahedron(T, color) {
  const g = new T.Group()
  const geo = new T.IcosahedronGeometry(0.4)
  const mesh = new T.Mesh(geo, mat(T, color, { roughness: 0.15, metalness: 0.25, emissive: color, emissiveIntensity: 0.12 }))
  g.add(mesh)
  g.userData = { id: 'icosahedron' }
  return g
}

export function createPlanet(T, color) {
  const g = new T.Group()
  const sphere = new T.Mesh(new T.SphereGeometry(0.3, 32, 32), mat(T, color, { roughness: 0.6 }))
  const ring = new T.Mesh(new T.TorusGeometry(0.48, 0.05, 12, 32), mat(T, 0xE67E22, { roughness: 0.5, metalness: 0.3 }))
  ring.rotation.x = 0.4
  ring.rotation.z = 0.3
  g.add(sphere, ring)
  g.userData = { id: 'planet' }
  return g
}

export function createRocket(T, color) {
  const g = new T.Group()
  const body = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 0.35, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }))
  body.position.y = 0
  const interstage = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.03, 16), mat(T, 0x222222, { roughness: 0.4 }))
  interstage.position.y = 0.19
  const secondStage = new T.Mesh(new T.CylinderGeometry(0.10, 0.12, 0.18, 16), mat(T, 0xDDDDDD, { roughness: 0.2 }))
  secondStage.position.y = 0.32
  const noseCone = new T.Mesh(new T.ConeGeometry(0.10, 0.16, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }))
  noseCone.position.y = 0.48
  g.add(body, interstage, secondStage, noseCone)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const nozzle = new T.Mesh(new T.CylinderGeometry(0.018, 0.022, 0.03, 8), mat(T, 0x444444, { metalness: 0.6 }))
      nozzle.position.set((col - 1) * 0.065, -0.175, (row - 1) * 0.065)
      g.add(nozzle)
    }
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const leg = new T.Mesh(new T.BoxGeometry(0.015, 0.1, 0.03), mat(T, 0x555555, { metalness: 0.3 }))
    leg.position.set(Math.cos(angle) * 0.14, -0.1, Math.sin(angle) * 0.14)
    g.add(leg)
  }
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const fin = new T.Mesh(new T.BoxGeometry(0.03, 0.05, 0.015), mat(T, 0x333333, { metalness: 0.3 }))
    fin.position.set(Math.cos(angle) * 0.14, 0.12, Math.sin(angle) * 0.14)
    g.add(fin)
  }
  g.userData = { id: 'rocket' }
  return g
}

export function createAtom(T, color) {
  const g = new T.Group()
  const core = new T.Mesh(new T.SphereGeometry(0.14, 16, 16), mat(T, color, { emissive: color, emissiveIntensity: 0.3 }))
  const orbit1 = new T.Mesh(new T.TorusGeometry(0.3, 0.02, 8, 24), mat(T, 0x3498DB, { roughness: 0.3 }))
  orbit1.rotation.x = Math.PI / 2
  const orbit2 = new T.Mesh(new T.TorusGeometry(0.3, 0.02, 8, 24), mat(T, 0x2ECC71, { roughness: 0.3 }))
  orbit2.rotation.z = Math.PI / 2
  const orbit3 = new T.Mesh(new T.TorusGeometry(0.3, 0.02, 8, 24), mat(T, 0xE74C3C, { roughness: 0.3 }))
  orbit3.rotation.x = Math.PI / 4
  orbit3.rotation.z = Math.PI / 4
  const e1 = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }))
  const e2 = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.5 }))
  g.add(core, orbit1, orbit2, orbit3, e1, e2)
  g.userData = { id: 'atom', atomElectrons: { e1, e2, angle: 0 } }
  return g
}

export function createLightbulb(T, color) {
  const g = new T.Group()
  const bulb = new T.Mesh(new T.SphereGeometry(0.28, 20, 20), mat(T, 0xF1C40F, { transparent: true, opacity: 0.85, emissive: 0xF1C40F, emissiveIntensity: 0.15, roughness: 0.1 }))
  bulb.scale.set(1, 1.1, 1)
  bulb.position.y = 0.2
  const base = new T.Mesh(new T.CylinderGeometry(0.15, 0.2, 0.12, 12), mat(T, 0x7F8C8D, { roughness: 0.4, metalness: 0.3 }))
  base.position.y = -0.12
  const tip = new T.Mesh(new T.SphereGeometry(0.04, 8, 8), mat(T, 0x7F8C8D, { roughness: 0.4, metalness: 0.3 }))
  tip.position.y = -0.2
  g.add(bulb, base, tip)
  g.userData = { id: 'lightbulb' }
  return g
}

export function createTesttube(T, color) {
  const g = new T.Group()
  const tube = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.45, 12), mat(T, 0xBDC3C7, { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0 }))
  tube.position.y = 0.1
  const liquid = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 0.22, 12), mat(T, 0x2ECC71, { transparent: true, opacity: 0.65, roughness: 0.1 }))
  liquid.position.y = -0.02
  const bottom = new T.Mesh(new T.SphereGeometry(0.1, 12, 12), mat(T, 0xBDC3C7, { transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0 }))
  bottom.position.y = -0.125
  const rim = new T.Mesh(new T.TorusGeometry(0.1, 0.012, 8, 16), mat(T, 0xBDC3C7, { roughness: 0.1, metalness: 0.2 }))
  rim.position.y = 0.325
  g.add(tube, liquid, bottom, rim)
  g.userData = { id: 'testtube' }
  return g
}

export function createPrism(T, color) {
  const g = new T.Group()
  const shape = new T.Shape()
  const s = 0.32
  shape.moveTo(0, -s)
  shape.lineTo(s * 0.866, s * 0.5)
  shape.lineTo(-s * 0.866, s * 0.5)
  shape.closePath()
  const geo = new T.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false })
  const mesh = new T.Mesh(geo, mat(T, color, { transparent: true, opacity: 0.6, roughness: 0.05, metalness: 0 }))
  mesh.rotation.x = -0.2
  g.add(mesh)
  g.userData = { id: 'prism' }
  return g
}

function createGlobeTexture(T) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#1a6ba0'
  ctx.fillRect(0, 0, 512, 256)
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
  ]
  blobs.forEach(b => {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2)
    ctx.fill()
  })
  return new T.CanvasTexture(c)
}

export function createGlobe(T, color) {
  const g = new T.Group()
  const sphere = new T.Mesh(new T.SphereGeometry(0.28, 32, 32), mat(T, color, { roughness: 0.3 }))
  const tex = createGlobeTexture(T)
  sphere.material.map = tex
  sphere.material.needsUpdate = true
  sphere.rotation.x = -0.15
  const stand = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.28, 8), mat(T, 0x7F8C8D, { roughness: 0.3, metalness: 0.4 }))
  stand.position.y = -0.35
  const base = new T.Mesh(new T.ConeGeometry(0.12, 0.05, 12), mat(T, 0x7F8C8D, { roughness: 0.3, metalness: 0.4 }))
  base.position.y = -0.48
  g.add(sphere, stand, base)
  g.userData = { id: 'globe' }
  return g
}

export function createTelescope(T, color) {
  const g = new T.Group()
  const tube = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, 0.45, 16), mat(T, 0x1a3a6a, { roughness: 0.3 }))
  tube.rotation.x = Math.PI / 2
  const hood = new T.Mesh(new T.CylinderGeometry(0.17, 0.14, 0.05, 16), mat(T, 0xEEEEEE, { roughness: 0.2 }))
  hood.rotation.x = Math.PI / 2
  hood.position.z = 0.25
  const finder = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.07, 8), mat(T, 0x222222, { roughness: 0.3 }))
  finder.rotation.x = Math.PI / 2
  finder.position.set(0, 0.16, 0.05)
  const finderEnd = new T.Mesh(new T.SphereGeometry(0.025, 6, 6), mat(T, 0x444444, { roughness: 0.3 }))
  finderEnd.position.set(0, 0.16, 0.09)
  const starSense = new T.Mesh(new T.BoxGeometry(0.05, 0.03, 0.05), mat(T, 0x333333, { roughness: 0.3, metalness: 0.4 }))
  starSense.position.set(0.1, -0.05, -0.08)
  const focuser = new T.Mesh(new T.CylinderGeometry(0.035, 0.04, 0.05, 8), mat(T, 0x888888, { roughness: 0.3, metalness: 0.4 }))
  focuser.position.set(0, -0.12, -0.2)
  focuser.rotation.x = Math.PI / 4
  const eyepiece = new T.Mesh(new T.CylinderGeometry(0.02, 0.025, 0.035, 8), mat(T, 0x555555, { roughness: 0.3, metalness: 0.3 }))
  eyepiece.position.set(0, -0.12, -0.24)
  eyepiece.rotation.x = Math.PI / 4
  const mountBase = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.08, 10), mat(T, 0x222222, { roughness: 0.3, metalness: 0.3 }))
  mountBase.position.y = -0.28
  g.add(tube, hood, finder, finderEnd, starSense, focuser, eyepiece, mountBase)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const leg = new T.Mesh(new T.CylinderGeometry(0.01, 0.015, 0.3, 6), mat(T, 0x888888, { roughness: 0.3, metalness: 0.4 }))
    leg.position.set(Math.cos(angle) * 0.1, -0.45, Math.sin(angle) * 0.1)
    leg.rotation.z = Math.cos(angle) * 0.2
    leg.rotation.x = Math.sin(angle) * 0.2
    g.add(leg)
  }
  const tray = new T.Mesh(new T.TorusGeometry(0.12, 0.01, 6, 12), mat(T, 0x444444, { roughness: 0.3, metalness: 0.3 }))
  tray.position.y = -0.35
  tray.rotation.x = Math.PI / 2
  g.add(tray)
  g.userData = { id: 'telescope' }
  return g
}

export function createSatellite(T, color) {
  const g = new T.Group()
  const body = new T.Mesh(new T.BoxGeometry(0.2, 0.15, 0.2), mat(T, 0xBDC3C7, { roughness: 0.3, metalness: 0.3 }))
  g.add(body)
  const panelL = new T.Mesh(new T.BoxGeometry(0.4, 0.015, 0.12), mat(T, 0x1a3a6a, { roughness: 0.5 }))
  panelL.position.x = -0.32
  const panelR = new T.Mesh(new T.BoxGeometry(0.4, 0.015, 0.12), mat(T, 0x1a3a6a, { roughness: 0.5 }))
  panelR.position.x = 0.32
  g.add(panelL, panelR)
  const armL = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.02, 4, 4, 4), mat(T, 0x7F8C8D, { roughness: 0.3, metalness: 0.3 }))
  armL.position.x = -0.12
  const armR = new T.Mesh(new T.BoxGeometry(0.02, 0.02, 0.02, 4, 4, 4), mat(T, 0x7F8C8D, { roughness: 0.3, metalness: 0.3 }))
  armR.position.x = 0.12
  g.add(armL, armR)
  const mast = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.18, 6), mat(T, 0xF1C40F, { roughness: 0.3 }))
  mast.position.y = 0.17
  const dish = new T.Mesh(new T.SphereGeometry(0.04, 8, 8), mat(T, 0xF1C40F, { emissive: 0xF1C40F, emissiveIntensity: 0.4, roughness: 0.2 }))
  dish.scale.set(1, 0.2, 1)
  dish.position.y = 0.28
  g.add(mast, dish)
  g.userData = { id: 'satellite' }
  return g
}

export { createSphere, createBox, createCylinder, createCone, createTorus, createRing, createTetrahedron, createOctahedron, createDodecahedron, createTorusKnot, createIcosahedron, createPlanet, createRocket, createAtom, createLightbulb, createTesttube, createPrism, createGlobe, createTelescope, createSatellite };
