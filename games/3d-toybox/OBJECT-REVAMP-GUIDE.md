# Object Revamp Guide

This guide documents the process for revamping 3D objects in Jelajah 3D, based on lessons learned from the Falcon Heavy rocket revamp. Follow these steps to avoid trial-and-error when porting new models.

## Overview

When replacing a simple procedural object with a detailed model (or creating a new detailed object from scratch), you must address:

1. **Scale** — Fit the model to the toybox viewport
2. **Centering** — Position the model's visual center at the origin
3. **Camera** — Choose orbit camera vs object rotation
4. **Interaction** — Configure drag behavior
5. **Scale override** — Exclude from automatic scaling if needed
6. **Rotation** — Set initial orientation

## Step 1: Calculate TOYBOX_SCALE

### Measure the source model
Determine the model's total height in its native units:
```js
// Example: Falcon Heavy
const totalHeight = CORE_FIRST_STAGE_HEIGHT + CORE_SECOND_STAGE_HEIGHT + FAIRING_HEIGHT
// = 6 + 3 + 3 = 12 units
```

### Determine target size
The toybox camera is at distance 5 for most objects, with FOV 40°. At this distance, the visible height is approximately 3.6 units.

For the object to fill ~70% of the screen height:
```
targetHeight = 3.6 * 0.7 = 2.52 units
```

### Calculate scale factor
```js
const TOYBOX_SCALE = targetHeight / totalHeight
// = 2.52 / 12 = 0.21 (but we used 0.12 for rocket to leave more margin)
```

**Rule of thumb:** Start with `TOYBOX_SCALE = 2.0 / totalHeight` and adjust visually.

## Step 2: Center the Model at Origin

### The critical formula
After applying `TOYBOX_SCALE`, the model's geometry is scaled, but its **position** is not automatically scaled. You must manually center it:

```js
const centerY = totalHeight / 2  // Model's center in native units
root.position.y = -centerY * TOYBOX_SCALE  // Center in world space
```

### Why this matters
If you only set `root.position.y = -centerY` (without multiplying by `TOYBOX_SCALE`), the model will be offset by the unscaled distance, placing it far from the camera's lookAt target.

**Example:**
- `centerY = 6` (native units)
- `TOYBOX_SCALE = 0.12`
- Correct: `root.position.y = -6 * 0.12 = -0.72`
- Wrong: `root.position.y = -6` (model appears 6 units below camera target)

## Step 3: Choose Camera Mode

### Option A: Orbit Camera (for tall/complex objects)
The camera moves around a stationary object. Best for:
- Tall objects (rockets, towers, trees)
- Objects with multiple viewing angles
- Objects where rotation would be disorienting

**Implementation:**
```js
// In showObject()
if (def.id === 'your-object') {
  group.position.set(0, 0, 0)
  group.rotation.set(0, 0, 0)  // No tilt
  camera.position.set(0, 0, 2.22)  // Adjust distance for desired size
  camera.lookAt(0, 0, 0)
}

// In onPointerMove()
if (currentGroup.userData.id === 'your-object') {
  orbitAzimuth -= dx * 0.01
  orbitElevation += dy * 0.01
  orbitElevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, orbitElevation))
  const r = 2.22  // Match camera distance
  camera.position.x = r * Math.cos(orbitElevation) * Math.sin(orbitAzimuth)
  camera.position.y = r * Math.sin(orbitElevation)
  camera.position.z = r * Math.cos(orbitElevation) * Math.cos(orbitAzimuth)
  camera.lookAt(0, 0, 0)
}
```

### Option B: Object Rotation (for compact objects)
The object rotates while the camera stays fixed. Best for:
- Compact objects (spheres, cubes, small items)
- Objects where rotation is intuitive
- Existing toybox objects

**Implementation:**
```js
// In showObject()
group.position.set(0, 0.3, 0)
camera.position.set(0, 1.5, 5)
camera.lookAt(0, 0.3, 0)
group.rotation.x = 0.1
group.rotation.y = 0.3

// In onPointerMove()
currentGroup.rotation.y += dx * 0.045
currentGroup.rotation.x += dy * 0.045
```

## Step 4: Configure Scale Override

### Automatic scaling
The toybox applies automatic scaling to science objects:
```js
if (def.type === 'science' && def.id !== 'telescope') {
  group.scale.setScalar(0.8)
}
```

### Exclusion
If your object manages its own scale internally (via `TOYBOX_SCALE`), exclude it:
```js
if (def.type === 'science' && def.id !== 'telescope' && def.id !== 'your-object') {
  group.scale.setScalar(0.8)
}
```

**Why:** The `fadeInGroup` animation sets `group.scale` from 0 to 1. If the automatic scaling also sets it to 0.8, you'll have conflicting scale operations.

## Step 5: Set Initial Rotation

### Orbit camera objects
Set rotation to zero — the camera does the moving:
```js
group.rotation.set(0, 0, 0)
```

### Object rotation objects
Apply a slight tilt for visual interest:
```js
group.rotation.x = 0.1
group.rotation.y = 0.3
```

## Step 6: Update game.js

### Add to factoryMap
```js
const factoryMap = {
  // ... existing entries
  'your-object': 'createYourObject',
}
```

### Add to objectDefs
```js
const objectDefs = [
  // ... existing entries
  { id: 'your-object', nameEn: 'Your Object', nameId: 'Objek Anda', emoji: '🎯', type: 'science' },
]
```

### Add camera/interaction branches
Update `showObject()` and `onPointerMove()` as shown in Step 3.

## Common Pitfalls

### 1. Model appears invisible
**Cause:** Model is positioned outside the camera's view frustum.
**Fix:** Check `root.position.y = -centerY * TOYBOX_SCALE` (see Step 2).

### 2. Model appears microscopic
**Cause:** `TOYBOX_SCALE` is too small, or camera is too far.
**Fix:** Increase `TOYBOX_SCALE` or decrease camera distance.

### 3. Model "orbits" when dragged
**Cause:** Camera lookAt target doesn't match the rotation pivot.
**Fix:** Use orbit camera mode (Step 3, Option A) or ensure `group.position` matches `camera.lookAt` target.

### 4. Model disappears at certain angles
**Cause:** Elevation clamp is too restrictive.
**Fix:** Use `Math.max(-Math.PI / 2, Math.min(Math.PI / 2, orbitElevation))` for full 360° vertical freedom.

### 5. Model flickers or has artifacts
**Cause:** Overlapping transparent geometry or incorrect depth settings.
**Fix:** Add `depthWrite: false` to transparent materials, or remove overlapping meshes.

### 6. ES modules fail to load
**Cause:** Python's `http.server` doesn't serve `.js` with correct MIME type.
**Fix:** Use a custom server that sets `application/javascript` for `.js` files, or use `npx serve`.

## Testing Checklist

- [ ] Model appears at correct size (~70% of screen height for tall objects)
- [ ] Model is centered in the viewport
- [ ] Drag interaction works smoothly (orbit or rotation)
- [ ] Full 360° viewing available (if using orbit camera)
- [ ] No visual artifacts or flickering
- [ ] Fade-in animation works correctly
- [ ] Switching to/from other objects works correctly
- [ ] Tap-to-hear-name works (raycasting hits the model)
- [ ] Model disposes correctly when switching away (no memory leaks)

## Code Template

### Minimal object structure
```js
const TOYBOX_SCALE = 0.12  // Adjust based on model size

export function createYourObject(T) {
  const wrapper = new T.Group()
  wrapper.name = 'YourObject'

  const root = new T.Group()
  
  // Build your model here...
  // const body = new T.Mesh(...)
  // root.add(body)

  const totalHeight = 12  // Your model's height in native units
  const centerY = totalHeight / 2
  root.position.y = -centerY * TOYBOX_SCALE

  root.scale.setScalar(TOYBOX_SCALE)
  wrapper.add(root)
  wrapper.userData = { id: 'your-object' }

  return wrapper
}
```

### game.js integration
```js
// showObject()
if (def.id === 'your-object') {
  group.position.set(0, 0, 0)
  group.rotation.set(0, 0, 0)
  camera.position.set(0, 0, 2.22)
  camera.lookAt(0, 0, 0)
} else {
  // ... existing code
}

// onPointerMove()
if (currentGroup.userData.id === 'your-object') {
  orbitAzimuth -= dx * 0.01
  orbitElevation += dy * 0.01
  orbitElevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, orbitElevation))
  const r = 2.22
  camera.position.x = r * Math.cos(orbitElevation) * Math.sin(orbitAzimuth)
  camera.position.y = r * Math.sin(orbitElevation)
  camera.position.z = r * Math.cos(orbitElevation) * Math.cos(orbitAzimuth)
  camera.lookAt(0, 0, 0)
} else {
  // ... existing code
}
```

## Summary

1. **Calculate scale:** `TOYBOX_SCALE = 2.0 / totalHeight`
2. **Center model:** `root.position.y = -centerY * TOYBOX_SCALE`
3. **Choose camera:** Orbit for tall objects, rotation for compact
4. **Exclude from auto-scale:** Add to the exclusion list if managing scale internally
5. **Set rotation:** Zero for orbit camera, slight tilt for object rotation
6. **Test thoroughly:** Use the checklist above

Following this guide will help you avoid the trial-and-error we experienced with the rocket revamp.
