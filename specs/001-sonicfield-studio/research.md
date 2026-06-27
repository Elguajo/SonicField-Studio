# Research: SonicField Studio

## 1. Raster vs Vector

The project requires both raster and vector output.

### Raster Strengths

- Dense particles
- Glow
- Blur
- Trails
- Shaders
- Realtime performance

### Vector Strengths

- Editable in Illustrator/Figma/Inkscape
- Scalable
- Better for print
- Better for plotter/laser workflows
- Clean geometry

### Key Constraint

A heavy raster particle scene cannot be exported naively as SVG without performance and file-size problems.

Therefore, vector export must be a simplified geometric interpretation of the same simulation.

---

## 2. Recommended Libraries

### Web Audio API

Use for audio analysis:

- `AudioContext`
- `AnalyserNode`
- `getByteFrequencyData`
- `getByteTimeDomainData`

### Three.js / React Three Fiber

Use later for high-density raster preview.

### Two.js

Useful for renderer-agnostic 2D graphics and SVG/canvas/webgl modes.

### Paper.js

Useful for path-heavy vector export and SVG manipulation.

---

## 3. Design Tool Positioning

The product should be closer to:

- generative poster tool;
- cymatics visual generator;
- audio-reactive pattern designer.

It should not become:

- DAW;
- music visualizer clone;
- video editor;
- node-based creative coding IDE.

---

## 4. Export Decision

MVP exports:

- PNG
- SVG
- JSON preset

Later exports:

- PDF
- WebM
- MP4
- SVG sequence
- image sequence
