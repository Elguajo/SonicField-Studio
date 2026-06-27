# Export Rules

## PNG Export

PNG export should capture the current visual state.

MVP:

- export active canvas;
- use current viewport size;
- filename: `sonicfield-{preset}-{timestamp}.png`.

Later:

- custom size;
- transparent background;
- supersampling;
- image sequence.

## SVG Export

SVG export must be native vector.

Forbidden:

- screenshot-to-SVG;
- raster base64 embedded inside SVG as primary output;
- automatic bitmap tracing.

Allowed:

- circles;
- paths;
- polylines;
- groups;
- metadata;
- background rect.

## SVG Optimization

Apply:

- sampling;
- simplification;
- max node count;
- grouped layers;
- rounded coordinates.

## Recommended Limits

```txt
Default max SVG nodes: 15,000
Safe default: 5,000
Warning threshold: 12,000
Hard cap: configurable but guarded
```

## JSON Preset Export

Preset must include:

- schema version;
- name;
- pattern mode;
- params;
- export settings;
- optional seed.
