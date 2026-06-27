# Renderer Architecture

## Core Rule

The simulation engine is the only layer allowed to decide geometry.

Renderers only draw or export geometry.

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

## Vector Renderer

Vector renderer must prioritize clean geometry:

- circles;
- paths;
- polylines;
- groups;
- metadata.

It should not attempt to reproduce raster-only effects like bloom.

## Why This Matters

If raster and vector are treated as the same rendering target, the product will fail:

- raster wants density and effects;
- vector wants editable clean geometry.

The shared simulation solves identity consistency while allowing each output to be optimized.
