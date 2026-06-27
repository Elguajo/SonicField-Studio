# Feature Specification: SonicField Studio MVP

**Feature Branch:** `001-sonicfield-studio`  
**Created:** 2026-06-26  
**Status:** Draft  
**Input:** Build a web application that generates beautiful sound-wave-inspired static particle and vector patterns. Users can adjust amplitude and other parameters, choose line/particle drawing modes, optionally animate the preview, and export the result either as raster or vector.

---

## 1. Product Summary

SonicField Studio is a browser-based generative design tool for creating static visual pattern assets.

It allows designers, motion designers, artists, and creative technologists to generate visual patterns from:

- mathematical waves;
- oscillator signals;
- uploaded audio;
- microphone input.

The user controls pattern parameters and exports the result as:

- PNG for raster use;
- SVG for vector editing;
- JSON preset for later editing.

The product is not a music player, DAW, or generic visualizer. It is a design tool for generating usable static visual assets. Preview animation is optional and off by default.

---

## 2. Target Users

### Primary User: Visual Designer

Needs quick abstract graphics for:

- posters;
- album covers;
- social media;
- backgrounds;
- branding systems;
- motion design frames.

### Secondary User: Motion Designer

Needs pattern stills and future animated sequences for:

- intro visuals;
- audio-reactive loops;
- brand films;
- event visuals.

### Tertiary User: Creative Coder

Needs a clean starting point for extending generative systems.

---

## 3. User Stories

### US-001: Generate a Pattern

As a designer, I want to open the app and instantly see a beautiful static pattern, so that I can start exploring without setup.

**Acceptance Criteria**

- On first load, a default preset renders automatically.
- The default pattern is visually meaningful, not empty.
- The default preview is static, not continuously animated.
- The app does not require login or account setup.

---

### US-002: Adjust Wave Parameters

As a designer, I want to change amplitude, frequency, phase, speed, symmetry, density, and noise, so that I can control the pattern.

**Acceptance Criteria**

- Each parameter has a visible control.
- Changing a parameter updates the visual within 100ms on a typical modern laptop.
- Parameter values are visible numerically.
- Reset returns to the default preset.

---

### US-003: Switch Pattern Types

As a designer, I want to switch between different pattern modes, so that I can create different visual families.

**Required Pattern Modes**

1. Wave Grid
2. Radial Cymatics
3. Lissajous Pattern
4. Sphere Field
5. Noise Flow

**Acceptance Criteria**

- Pattern switch updates the canvas.
- Existing parameter values remain active when switching.
- Each pattern mode has a distinct visual character.

---

### US-004: Use Audio Input

As a designer, I want to generate or load sound and use it to drive visual deformation.

**Required Audio Sources**

1. Built-in oscillator
2. Uploaded audio file
3. Microphone input

**Acceptance Criteria**

- Audio starts only after user interaction.
- Uploaded audio loops for preview.
- Microphone permission denial is handled gracefully.
- Audio analysis exposes bass, mids, highs, volume, waveform, and frequency arrays.
- Audio-reactive changes apply when the user explicitly starts an audio source.

---

### US-004A: Choose Drawing Mode

As a designer, I want to choose whether the pattern is made from lines, particles, or both, so that I can generate different asset styles from the same simulation.

**Required Drawing Modes**

1. Lines + Particles
2. Lines Only
3. Particles Only

**Acceptance Criteria**

- Draw mode is controlled independently from pattern mode.
- Raster preview respects the selected draw mode.
- SVG export respects the selected draw mode.
- Particles-only SVG export contains editable circle elements and does not require path elements.

---

### US-004B: Optional Preview Animation

As a designer, I want animation to be opt-in, so that the default tool behaves like a static design instrument.

**Acceptance Criteria**

- Preview animation is disabled by default.
- A visible checkbox or equivalent control enables animation.
- When animation is disabled, parameter changes still update the preview immediately.
- Export behavior is deterministic and based on the current static geometry.

---

### US-005: Export Raster Image

As a designer, I want to export the current pattern as PNG, so that I can use it in Photoshop, Figma, social media, or presentations.

**Acceptance Criteria**

- Export button downloads PNG.
- PNG matches the current visual state.
- Export size can start with viewport size in MVP.
- Later export sizes can be added.

---

### US-006: Export Native Vector

As a designer, I want to export the pattern as SVG, so that I can edit it in Illustrator, Figma, Inkscape, or use it for print/vector workflows.

**Acceptance Criteria**

- SVG is generated from geometry, not from raster tracing.
- SVG contains meaningful vector elements:
  - circles;
  - paths;
  - polylines;
  - groups.
- SVG opens in common vector editors.
- SVG export has density/simplification controls.
- If the export is too large, the app warns the user or simplifies automatically.

---

### US-007: Save and Load Presets

As a designer, I want to save settings as JSON and load them later, so that I can continue editing a pattern.

**Acceptance Criteria**

- User can export preset JSON.
- User can import preset JSON.
- Invalid preset files are rejected with a clear error.
- Preset schema version is included.

---

### US-008: Randomize

As a designer, I want to randomize parameters, so that I can quickly discover unexpected patterns.

**Acceptance Criteria**

- Randomize changes multiple parameters.
- Generated values remain within safe limits.
- Randomized pattern remains exportable.

---

## 4. Functional Requirements

### FR-001: Shared Simulation Engine

The system must generate pattern geometry through a renderer-independent simulation engine.

The simulation engine must output:

- points;
- paths;
- optional metadata;
- estimated SVG node count;
- warnings.

### FR-002: Raster Renderer

The raster renderer must support static preview by default and optional realtime animation when enabled by the user.

Initial MVP may use Canvas 2D, but planned implementation should support WebGL/Three.js for high-density particles.

### FR-003: Vector Renderer / Exporter

The vector renderer/exporter must convert simulation output into SVG.

It must not use raster tracing.

The vector exporter must support line, particle, and combined draw modes from the same simulation geometry.

### FR-004: Audio Analysis

The system must analyze audio with Web Audio API.

Required audio values:

- volume;
- bass;
- mids;
- highs;
- waveform;
- frequency data.

### FR-005: Parameter Store

The system must maintain all editable state in a predictable store.

Required state:

- output mode;
- pattern mode;
- draw mode;
- animation enabled flag;
- audio source;
- params;
- active preset;
- export settings;
- errors/warnings.

### FR-006: Export Settings

The system must support export settings:

- raster width;
- raster height;
- background;
- transparent background toggle;
- SVG simplification;
- max SVG nodes;
- include background in SVG.
- draw mode.

### FR-007: Error Handling

The app must show clear UI errors for:

- WebGL unavailable;
- audio context blocked;
- microphone denied;
- audio decode failed;
- SVG too heavy;
- invalid preset JSON.

---

## 5. Non-Functional Requirements

### NFR-001: Performance

- Default scene should render quickly as a static pattern on a modern laptop.
- Optional animation should render smoothly on a modern laptop when enabled.
- Vector export should complete within a reasonable time for default presets.
- High-density exports must be capped or simplified.

### NFR-002: Maintainability

- Simulation logic must be isolated from UI and rendering.
- Audio engine must be isolated.
- Export logic must be isolated.
- Types must be explicit.

### NFR-003: Accessibility

- Controls must be keyboard accessible.
- Buttons and inputs must have readable labels.
- Error messages must be visible as text.

### NFR-004: Browser Safety

- Audio must start only after user action.
- Microphone must not be requested on page load.
- No user audio is uploaded to a server in MVP.

---

## 6. Out of Scope for MVP

- User accounts
- Backend
- Cloud storage
- Payment
- Marketplace
- Timeline editor
- Video export
- Animated SVG export
- Mobile-first UX
- Collaborative editing
- AI image generation
- Server-side rendering

---

## 7. Success Metrics

MVP is successful if:

1. A user can create at least 10 visually distinct outputs in under 5 minutes.
2. PNG export works reliably.
3. SVG export opens in Illustrator/Figma/Inkscape.
4. The app remains responsive while editing parameters.
5. Users can generate line-based, particle-based, and combined static assets.
6. The architecture makes it easy to add video export later.

---

## 8. Edge Cases

- User exports SVG with too many particles.
- User uploads corrupt audio.
- User denies microphone permission.
- User opens app in unsupported browser.
- User imports invalid preset JSON.
- User uses extreme parameter values.
- User switches modes during audio playback.
- User resizes browser while rendering.
- User sets density too high for vector output.
- User switches between lines-only, particles-only, and combined drawing modes.
- User enables and disables preview animation.

---

## 9. Assumptions

- MVP is client-only.
- No backend is required.
- Browser APIs are enough for initial audio analysis.
- Vector export is static SVG only.
- Preview animation is a convenience for exploration, not the primary output mode.
- Animated vector export, if needed later, should be SVG sequence rather than one heavy animated SVG.
