# Export Rules

## PNG Export

PNG export should capture the current visual state.

MVP:

- export active canvas;
- use configured raster size or the current viewport-backed canvas;
- filename: `sonicfield-{preset}-{timestamp}.png`.
- support transparent background when requested.

Later:

- supersampling;
- image sequence.

## SVG Export

SVG export must be native vector.
SVG export must respect the selected draw mode.

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

Draw modes:

- Lines Only: path/polyline geometry only.
- Particles Only: editable, non-overlapping circle geometry only.
- Lines + Particles: both groups.

## SVG Optimization

Apply:

- sampling;
- simplification;
- path smoothing;
- particle overlap filtering;
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
- draw mode;
- animation preference;
- params;
- export settings;
- optional seed.

Preset params include `pathSmoothing` from `0` to `1`. Older preset files that omit it should load with the app default.
