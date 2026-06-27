# Implementation Plan: SonicField Studio MVP

## 1. Technical Context

**Language:** TypeScript  
**Framework:** Next.js + React  
**Styling:** Tailwind CSS  
**State:** Zustand  
**Audio:** Web Audio API  
**Raster:** Canvas 2D for starter, Three.js/WebGL target  
**Vector:** Native SVG generation, optionally Paper.js or Two.js  
**Backend:** None for MVP  
**Storage:** Local file export/import only  
**Testing:** TypeScript checks + unit tests for simulation/export when added

---

## 2. Architecture

The project must be split into independent layers.

```txt
UI Layer
  ├─ TopBar
  ├─ ControlPanel
  ├─ Viewport
  └─ Export dialogs

State Layer
  └─ Zustand store

Domain Layer
  ├─ Simulation Engine
  ├─ Audio Engine
  ├─ Preset Engine
  └─ Export Engine

Rendering Layer
  ├─ Raster Renderer
  └─ Vector Exporter
```

---

## 3. Core Design Decision

### Decision: Shared Simulation Engine

Use a renderer-independent simulation engine.

**Reason:**  
Raster and vector output must represent the same pattern. If each renderer has separate logic, outputs will diverge.

**Implementation:**  
`generatePatternGeometry()` receives:

- parameters;
- pattern mode;
- dimensions;
- time;
- audio frame.

It returns:

- `points`;
- `paths`;
- metadata.

---

## 4. Renderer Strategy

### Raster

Starter:

- Canvas 2D for easy MVP verification.

Target:

- Three.js/React Three Fiber for high-density particles and shaders.

Raster may include:

- glow;
- blur;
- trails;
- bloom;
- additive blending.

### Vector

Vector export should be generated directly from geometry.

Allowed SVG elements:

- `circle`;
- `path`;
- `polyline`;
- `g`;
- `rect`;
- `title`;
- `desc`.

Vector mode must simplify geometry.

---

## 5. Data Flow

```txt
User changes control
  ↓
Zustand updates params
  ↓
Simulation engine recalculates geometry
  ↓
Viewport renders current mode
  ↓
Export reads same geometry
  ↓
PNG/SVG/JSON is downloaded
```

Audio flow:

```txt
Audio source
  ↓
Web Audio API
  ↓
AnalyserNode
  ↓
AudioAnalysisFrame
  ↓
Simulation engine
  ↓
Geometry displacement
```

---

## 6. File Structure

```txt
app/
  layout.tsx
  page.tsx
  globals.css

src/
  components/
    TopBar.tsx
    ControlPanel.tsx
    Viewport.tsx

  lib/
    audio/
      audioEngine.ts
    simulation/
      simulationEngine.ts
    renderers/
      rasterRenderer.ts
      vectorExporter.ts
    presets.ts

  store/
    useStudioStore.ts

  types/
    index.ts

specs/
  001-sonicfield-studio/
    spec.md
    plan.md
    tasks.md
```

---

## 7. MVP Milestones

### Milestone 1: Static Pattern Engine

- Implement type-safe parameters.
- Generate Wave Grid.
- Generate Radial Cymatics.
- Render to Canvas.
- Show controls.

### Milestone 2: Pattern Variety

- Add Lissajous.
- Add Sphere Field.
- Add Noise Flow.
- Add presets.
- Add randomize/reset.

### Milestone 3: Export

- Add PNG export.
- Add SVG export.
- Add preset JSON export/import.
- Add vector density guard.

### Milestone 4: Audio

- Add AudioEngine.
- Add oscillator.
- Add audio file upload.
- Add microphone input.
- Map bass/mids/highs/volume to geometry.

### Milestone 5: Polish

- Improve UI.
- Add error handling.
- Add visual warnings.
- Add export settings.
- Add quick help text.

---

## 8. Performance Strategy

### Raster

- Use `requestAnimationFrame`.
- Avoid React state updates per frame.
- Move heavy per-frame rendering outside React where possible.
- Use typed arrays when switching to WebGL particles.

### Vector

- Generate SVG only on demand.
- Use sampling and simplification.
- Cap SVG nodes.
- Warn before exporting heavy SVG.

Default limits:

```txt
Max live raster particles: 50,000 initially
Max SVG nodes: 15,000 initially
Default SVG nodes: 2,000–8,000
```

---

## 9. Export Rules

### PNG

- Export current canvas.
- Use viewport size for MVP.
- Future: allow custom export size.

### SVG

- Use simulation geometry.
- Use simplification.
- Do not rasterize.
- Include metadata:
  - app name;
  - preset name;
  - dimensions;
  - parameter snapshot.

### JSON Preset

- Include schema version.
- Include pattern mode.
- Include params.
- Include export settings.

---

## 10. Risk Analysis

### Risk: SVG becomes too heavy

Mitigation:

- max node count;
- sampling;
- user warning;
- path simplification.

### Risk: Realtime audio causes performance drops

Mitigation:

- smooth audio frame values;
- throttle expensive geometry rebuilds;
- avoid unnecessary allocations.

### Risk: Visual output feels too technical

Mitigation:

- strong presets;
- good default state;
- designer-oriented names.

### Risk: Two renderers diverge visually

Mitigation:

- all pattern data comes from shared simulation engine.

---

## 11. Future Extensions

Not for MVP:

- video export;
- SVG sequence export;
- timeline;
- MIDI;
- preset marketplace;
- accounts;
- cloud sync;
- WebGPU;
- shader editor;
- Figma plugin;
- Adobe Illustrator script;
- Lottie export.
