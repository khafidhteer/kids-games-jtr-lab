# Kids Games

A collection of zero-frustration browser games for children aged 2–6 with bilingual support (English / Bahasa Indonesia).

## Language

**Jelajah 3D**:
A 3D exploratory game where toddlers tap interactive objects rendered with Three.js to hear their names spoken aloud. Objects are geometric primitives or simple science-themed compositions built from combined Three.js geometries.
_Avoid_: 3D Toybox, Explore 3D

**Geometric Object**:
A 3D shape built from a single Three.js geometry primitive (SphereGeometry, BoxGeometry, ConeGeometry, etc.) with a solid color PBR material.
_Avoid_: Shape, primitive, mesh

**Science Object**:
A 3D object composed of multiple Three.js geometries grouped together to represent a recognisable science-themed item (rocket, planet, atom, lightbulb). Each part may have a different material.

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
