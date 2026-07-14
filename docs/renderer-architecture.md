# Renderer Architecture

## Core Rule

The simulation engine is the only layer allowed to decide geometry.

Renderers only draw or export geometry. They may choose whether to draw lines, particles, or both, but they must not create new pattern logic.

## Simulation Output

The engine returns:

- points;
- paths;
- metadata;
- warnings.

## Raster Renderer

Raster renderer can enhance the visual:

- glow;
- blur;
- trails;
- bloom;
- particle depth.

These effects do not need to exist in SVG.

Raster preview is static by default. Animation is opt-in and should only run a requestAnimationFrame loop while enabled.

Line rendering may smooth simulation paths for presentation, but smoothing must use the shared path points and must not invent separate pattern logic.

Particle rendering should avoid visible overlap by filtering the particle layer deterministically at render time. This filtering must not mutate the shared path geometry.

## Vector Renderer

Vector renderer must prioritize clean geometry:

- circles;
- paths;
- polylines;
- groups;
- metadata.

It should not attempt to reproduce raster-only effects like bloom.

Vector paths may use the same smoothing parameter as raster preview, emitted as native SVG path curves.

Vector particle export should avoid overlapping circles before SVG node sampling so exported particle-only artwork remains editable and visually clean.

Vector export must respect the selected draw mode:

- Lines Only exports path/polyline-style geometry.
- Particles Only exports editable non-overlapping circle elements.
- Lines + Particles exports both groups.

## Why This Matters

If raster and vector are treated as the same rendering target, the product will fail:

- raster wants density and effects;
- vector wants editable clean geometry.

The shared simulation solves identity consistency while allowing each output to be optimized.
