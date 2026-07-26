# Kids Games

A collection of zero-frustration browser games for children aged 2–6 with bilingual support (English / Bahasa Indonesia).

## Language

**Jelajah 3D**:
A 3D exploratory game where toddlers browse a carousel of 20 interactive objects (11 geometric, 9 science-themed) rendered with Three.js. One object is shown at a time; children navigate via an emoji pagination bar at the bottom of the screen and can drag to rotate each object.
_Avoid_: 3D Toybox

**Geometric Object**:
A 3D shape built from a single Three.js geometry primitive (SphereGeometry, BoxGeometry, ConeGeometry, IcosahedronGeometry, etc.) with a solid color PBR material.

**Science Object**:
A 3D object composed of multiple Three.js geometries grouped to represent a recognisable science-themed item (SpaceX Falcon Heavy rocket with 3 boosters and decals, Celestron-inspired telescope, planet with ring, atom with orbiting electrons, globe with map texture).

**Emoji Carousel**:
A paginated bottom bar showing 3 emoji icons at a time from the 20-object collection. Prev/◀ and next/▶ buttons scroll the emoji strip. Tapping an emoji selects and displays the corresponding 3D object.

**Drag-to-Rotate**:
A touch interaction where the child drags left/right on the screen to spin the currently displayed 3D object around its Y axis. No auto-rotation — the child controls the viewing angle. For most objects, the object itself rotates. For the rocket, the camera orbits around the stationary model instead (see Orbit Camera).

**Orbit Camera**:
A camera control mode used exclusively for the Falcon Heavy rocket. The rocket stays fixed at the scene origin, pointing straight up. Dragging left/right or up/down moves the camera along a sphere of radius 2 units centered on the rocket, always looking at the rocket's visual center. Elevation is clamped to ±60° to prevent flipping. This lets the child walk around the rocket and view it from any angle — front, side, back — while it remains full-frame on screen.
_Avoid_: object rotation for rocket, auto-orbit

**Zero-Frustration**:
A design principle where every interaction produces immediate positive feedback. No scores, timers, lose states, wrong answers, or rules. The child cannot make a "mistake."
_Avoid_: Game over, fail state, scoring

**Math Gate**:
A parent-access control pattern requiring the user to solve a simple addition problem (1+1 to 8+8) before accessing settings (language toggle, help, back navigation). Prevents toddlers from changing settings accidentally.

**Bilingual Toggle**:
A UI pattern allowing seamless switching between English and Bahasa Indonesia for all spoken labels. Protected by the Math Gate.

**Three.js**:
A JavaScript 3D library loaded from jsDelivr CDN as an ES module. Used exclusively in Jelajah 3D for WebGL rendering. Not loaded by any other game.
_Avoid_: WebGL, 3D engine
