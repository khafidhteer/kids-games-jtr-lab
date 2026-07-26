const CORE_RADIUS = 0.4
const BOOSTER_RADIUS = 0.38
const CORE_FIRST_STAGE_HEIGHT = 6
const CORE_SECOND_STAGE_HEIGHT = 3
const FAIRING_HEIGHT = 3.0
const FAIRING_RADIUS = CORE_RADIUS * 1.25
const BOOSTER_HEIGHT = 5.5
const BOOSTER_SPACING = 0.78
const INTERSTAGE_HEIGHT = 0.3
const NOSE_CONE_HEIGHT = 0.8
const ENGINE_BELL_HEIGHT = 0.5
const ENGINE_BELL_TOP_RADIUS = 0.06
const ENGINE_BELL_BOTTOM_RADIUS = 0.12
const TOYBOX_SCALE = 0.12

function createMaterials(T) {
  const whiteBody = new T.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.0, roughness: 0.45 })
  const blackComposite = new T.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.0, roughness: 0.55 })
  const engineMetal = new T.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.85, roughness: 0.30 })
  const trussBlack = new T.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.50 })
  return { whiteBody, blackComposite, engineMetal, trussBlack }
}

function createSpacexTexture(T, width = 128, height = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#0033a0'
  ctx.font = 'bold 48px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SPACEX', 0, 0)
  ctx.restore()
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

function createUSFlagTexture(T, width = 256, height = 160) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const stripeHeight = height / 13
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#b22234' : '#ffffff'
    ctx.fillRect(0, i * stripeHeight, width, stripeHeight)
  }
  const cantonW = width * 0.4
  const cantonH = stripeHeight * 7
  ctx.fillStyle = '#3c3b6e'
  ctx.fillRect(0, 0, cantonW, cantonH)
  ctx.fillStyle = '#ffffff'
  const starSize = 4
  const cols = 6
  const rows = 5
  const padX = cantonW / (cols + 1)
  const padY = cantonH / (rows + 1)
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : padX / 2
    const count = r % 2 === 0 ? cols : cols - 1
    for (let c = 0; c < count; c++) {
      const x = padX + c * padX + offset
      const y = padY + r * padY
      drawStar(ctx, x, y, starSize)
    }
  }
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

function createInsigniaTexture(T, size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.35
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#0033a0'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2)
  ctx.fillStyle = '#cc0000'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  return texture
}

function buildCentralCore(T, mats) {
  const group = new T.Group()
  group.name = 'central-core'

  const firstStage = new T.Mesh(
    new T.CylinderGeometry(CORE_RADIUS, CORE_RADIUS, CORE_FIRST_STAGE_HEIGHT, 32),
    mats.whiteBody
  )
  firstStage.name = 'core-first-stage'
  firstStage.position.y = CORE_FIRST_STAGE_HEIGHT / 2
  firstStage.castShadow = true
  firstStage.receiveShadow = true
  group.add(firstStage)

  const interstage = new T.Mesh(
    new T.CylinderGeometry(CORE_RADIUS + 0.01, CORE_RADIUS + 0.01, INTERSTAGE_HEIGHT, 32),
    mats.blackComposite
  )
  interstage.name = 'interstage'
  interstage.position.y = CORE_FIRST_STAGE_HEIGHT + INTERSTAGE_HEIGHT / 2
  interstage.castShadow = true
  group.add(interstage)

  const secondStage = new T.Mesh(
    new T.CylinderGeometry(CORE_RADIUS * 0.95, CORE_RADIUS * 0.95, CORE_SECOND_STAGE_HEIGHT, 32),
    mats.whiteBody
  )
  secondStage.name = 'core-second-stage'
  secondStage.position.y = CORE_FIRST_STAGE_HEIGHT + INTERSTAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT / 2
  secondStage.castShadow = true
  secondStage.receiveShadow = true
  group.add(secondStage)

  const fairingBaseY = CORE_FIRST_STAGE_HEIGHT + INTERSTAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT
  const fairing = buildPayloadFairing(T, mats)
  fairing.position.y = fairingBaseY
  group.add(fairing)

  const engines = buildEngineCluster(T, mats, 9, CORE_RADIUS * 0.7)
  engines.name = 'core-engine-cluster'
  engines.position.y = 0
  group.add(engines)

  const legs = buildLegFairings(T, mats, CORE_RADIUS)
  legs.name = 'core-leg-fairings'
  legs.position.y = 0
  group.add(legs)

  const flagTex = createUSFlagTexture(T)
  const flagMat = new T.MeshStandardMaterial({ map: flagTex, metalness: 0, roughness: 0.6, transparent: true, alphaTest: 0.1 })
  const flag = new T.Mesh(new T.PlaneGeometry(0.4, 0.25), flagMat)
  flag.name = 'decal-flag'
  flag.position.set(0, CORE_FIRST_STAGE_HEIGHT + INTERSTAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT * 0.6, CORE_RADIUS * 0.95 + 0.01)
  group.add(flag)

  const insTex = createInsigniaTexture(T)
  const insMat = new T.MeshStandardMaterial({ map: insTex, metalness: 0, roughness: 0.6, transparent: true, alphaTest: 0.1 })
  const insignia = new T.Mesh(new T.PlaneGeometry(0.2, 0.2), insMat)
  insignia.name = 'decal-insignia'
  insignia.position.set(0, CORE_FIRST_STAGE_HEIGHT + INTERSTAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT * 0.35, CORE_RADIUS * 0.95 + 0.01)
  group.add(insignia)

  return group
}

function buildPayloadFairing(T, mats) {
  const group = new T.Group()
  group.name = 'payload-fairing'
  const points = []
  const segments = 24
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * FAIRING_HEIGHT
    const ogive = Math.sqrt(1 - t * t)
    const r = Math.max(FAIRING_RADIUS * ogive, FAIRING_RADIUS * 0.15)
    points.push(new T.Vector2(r, y))
  }
  const fairingGeo = new T.LatheGeometry(points, 32)
  const fairing = new T.Mesh(fairingGeo, mats.whiteBody)
  fairing.name = 'fairing-shell'
  fairing.castShadow = true
  fairing.receiveShadow = true
  group.add(fairing)
  return group
}

function buildOgiveNose(T, mats, baseRadius, height) {
  const points = []
  const segments = 20
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * height
    const ogive = Math.sqrt(1 - t * t)
    const r = baseRadius * ogive
    points.push(new T.Vector2(Math.max(r, 0.001), y))
  }
  const noseGeo = new T.LatheGeometry(points, 32)
  return new T.Mesh(noseGeo, mats.whiteBody)
}

function buildSideBooster(T, mats, side) {
  const group = new T.Group()
  group.name = 'side-booster-' + side

  const body = new T.Mesh(
    new T.CylinderGeometry(BOOSTER_RADIUS, BOOSTER_RADIUS, BOOSTER_HEIGHT, 32),
    mats.whiteBody
  )
  body.name = 'booster-' + side + '-body'
  body.position.y = BOOSTER_HEIGHT / 2
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const noseCone = buildOgiveNose(T, mats, BOOSTER_RADIUS, NOSE_CONE_HEIGHT)
  noseCone.name = 'booster-' + side + '-nose'
  noseCone.position.y = BOOSTER_HEIGHT
  noseCone.castShadow = true
  group.add(noseCone)

  const engines = buildEngineCluster(T, mats, 9, BOOSTER_RADIUS * 0.7)
  engines.name = 'booster-' + side + '-engines'
  engines.position.y = 0
  group.add(engines)

  const legs = buildLegFairings(T, mats, BOOSTER_RADIUS)
  legs.name = 'booster-' + side + '-legs'
  legs.position.y = 0
  group.add(legs)

  const spacexTex = createSpacexTexture(T)
  spacexTex.center.set(0.5, 0.5)
  spacexTex.rotation = -Math.PI / 2
  const spacexMat = new T.MeshStandardMaterial({ map: spacexTex, metalness: 0, roughness: 0.6, transparent: true, alphaTest: 0.1 })
  const spacexDecal = new T.Mesh(new T.PlaneGeometry(1.5, 0.35), spacexMat)
  spacexDecal.name = 'decal-spacex-' + side
  spacexDecal.position.set(0, BOOSTER_HEIGHT * 0.55, BOOSTER_RADIUS + 0.01)
  group.add(spacexDecal)

  return group
}

function buildEngineCluster(T, mats, count, spreadRadius) {
  const group = new T.Group()
  const bellProfile = []
  const bellSegs = 12
  for (let i = 0; i <= bellSegs; i++) {
    const t = i / bellSegs
    const y = -t * ENGINE_BELL_HEIGHT
    const r = T.MathUtils.lerp(ENGINE_BELL_TOP_RADIUS, ENGINE_BELL_BOTTOM_RADIUS, t * t)
    bellProfile.push(new T.Vector2(r, y))
  }
  const bellGeo = new T.LatheGeometry(bellProfile, 16)
  const instancedBells = new T.InstancedMesh(bellGeo, mats.engineMetal, count)
  instancedBells.name = 'engine-bells'
  instancedBells.castShadow = true
  const dummy = new T.Object3D()
  dummy.position.set(0, 0, 0)
  dummy.updateMatrix()
  instancedBells.setMatrixAt(0, dummy.matrix)
  const outerCount = count - 1
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2
    dummy.position.set(Math.cos(angle) * spreadRadius, 0, Math.sin(angle) * spreadRadius)
    dummy.updateMatrix()
    instancedBells.setMatrixAt(i + 1, dummy.matrix)
  }
  instancedBells.instanceMatrix.needsUpdate = true
  group.add(instancedBells)
  return group
}

function buildLegFairings(T, mats, bodyRadius) {
  const group = new T.Group()
  const legShape = new T.Shape()
  legShape.moveTo(-0.10, 0)
  legShape.lineTo(0.10, 0)
  legShape.quadraticCurveTo(0.08, 0.4, 0.04, 0.8)
  legShape.lineTo(-0.04, 0.8)
  legShape.quadraticCurveTo(-0.08, 0.4, -0.10, 0)
  legShape.closePath()
  const legGeo = new T.ExtrudeGeometry(legShape, {
    depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4,
  })
  legGeo.translate(0, 0, -0.075)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const leg = new T.Mesh(legGeo, mats.blackComposite)
    leg.name = 'leg-fairing-' + i
    leg.position.set(
      Math.cos(angle) * (bodyRadius + 0.075),
      0,
      Math.sin(angle) * (bodyRadius + 0.075)
    )
    leg.rotation.y = -angle + Math.PI / 2
    leg.castShadow = true
    group.add(leg)
  }
  return group
}

function buildTruss(T, mats) {
  const group = new T.Group()
  group.name = 'truss-connector'
  const mainBar = new T.Mesh(new T.BoxGeometry(0.5, 0.12, 0.08), mats.trussBlack)
  mainBar.castShadow = true
  group.add(mainBar)
  const upperClamp = new T.Mesh(new T.BoxGeometry(0.08, 0.25, 0.12), mats.trussBlack)
  upperClamp.position.set(-0.22, 0, 0)
  upperClamp.castShadow = true
  group.add(upperClamp)
  const lowerClamp = new T.Mesh(new T.BoxGeometry(0.08, 0.25, 0.12), mats.trussBlack)
  lowerClamp.position.set(0.22, 0, 0)
  lowerClamp.castShadow = true
  group.add(lowerClamp)
  const crossBrace = new T.Mesh(new T.BoxGeometry(0.4, 0.04, 0.04), mats.trussBlack)
  crossBrace.position.set(0, -0.08, 0)
  crossBrace.rotation.z = 0.15
  crossBrace.castShadow = true
  group.add(crossBrace)
  return group
}

function buildUpperTruss(T, mats) {
  const group = new T.Group()
  group.name = 'upper-truss-connector'
  const horizontalBeam = new T.Mesh(new T.BoxGeometry(0.55, 0.15, 0.10), mats.trussBlack)
  horizontalBeam.castShadow = true
  group.add(horizontalBeam)
  const leftClamp = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.18, 16), mats.trussBlack)
  leftClamp.position.set(-0.25, 0, 0)
  leftClamp.rotation.z = Math.PI / 2
  leftClamp.castShadow = true
  group.add(leftClamp)
  const rightClamp = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.18, 16), mats.trussBlack)
  rightClamp.position.set(0.25, 0, 0)
  rightClamp.rotation.z = Math.PI / 2
  rightClamp.castShadow = true
  group.add(rightClamp)
  return group
}

export function createFalconHeavy(T) {
  const wrapper = new T.Group()
  wrapper.name = 'FalconHeavy'

  const root = new T.Group()
  const mats = createMaterials(T)

  const centralCore = buildCentralCore(T, mats)
  root.add(centralCore)

  const boosterLeft = buildSideBooster(T, mats, 'left')
  boosterLeft.position.set(-BOOSTER_SPACING, 0, 0)
  root.add(boosterLeft)

  const boosterRight = buildSideBooster(T, mats, 'right')
  boosterRight.position.set(BOOSTER_SPACING, 0, 0)
  root.add(boosterRight)

  const trussLeft = buildTruss(T, mats)
  trussLeft.position.set(-BOOSTER_SPACING / 2, CORE_FIRST_STAGE_HEIGHT * 0.85, 0)
  root.add(trussLeft)

  const trussRight = buildTruss(T, mats)
  trussRight.position.set(BOOSTER_SPACING / 2, CORE_FIRST_STAGE_HEIGHT * 0.85, 0)
  root.add(trussRight)

  const upperTrussLeft = buildUpperTruss(T, mats)
  upperTrussLeft.position.set(-BOOSTER_SPACING / 2, BOOSTER_HEIGHT - 0.3, 0)
  root.add(upperTrussLeft)

  const upperTrussRight = buildUpperTruss(T, mats)
  upperTrussRight.position.set(BOOSTER_SPACING / 2, BOOSTER_HEIGHT - 0.3, 0)
  root.add(upperTrussRight)

  const centerY = (CORE_FIRST_STAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT + FAIRING_HEIGHT) / 2
  root.position.y = -centerY * TOYBOX_SCALE

  root.scale.setScalar(TOYBOX_SCALE)
  wrapper.add(root)
  wrapper.userData = { id: 'rocket' }

  return wrapper
}
