# SonicField Studio Constitution

## Project Identity

SonicField Studio is a creative coding web application for generating audio-driven and mathematically driven visual patterns.

The project must behave like a professional design tool, not like a disposable WebGL demo.

## Non-Negotiable Principles

### I. Specification Is Source of Truth

All implementation decisions must trace back to:

- `specs/001-sonicfield-studio/spec.md`
- `specs/001-sonicfield-studio/plan.md`
- `specs/001-sonicfield-studio/tasks.md`

If a requirement is unclear, the agent must update the spec or record an assumption before implementing.

### II. One Simulation, Multiple Outputs

The app must use a shared simulation engine that generates abstract geometry data.

Renderers must not contain business logic or pattern rules.

Required renderer/export layers:

- Raster renderer
- Vector renderer/exporter

Forbidden:

- generating SVG by tracing a raster screenshot;
- making vector mode a fake screenshot download;
- duplicating pattern logic separately inside each renderer.

### III. Native Vector Export

SVG export must be generated from geometry:

- points;
- paths;
- circles;
- polylines;
- grouped layers.

Vector export must include simplification and density limits.

### IV. Raster Preview Must Stay Smooth

Raster preview should prioritize responsiveness:

- avoid excessive object allocation per frame;
- avoid recalculating unchanged state unnecessarily;
- use typed arrays or efficient arrays when moving to WebGL;
- provide safe particle defaults.

### V. Designer-First UX

The interface must prioritize:

- visual clarity;
- immediate beautiful default state;
- simple parameter exploration;
- predictable export;
- readable presets.

The app must not require login, onboarding, account creation, or backend for MVP.

### VI. Export Integrity

Every export must match the visible pattern conceptually.

PNG may include glow, blur, trails, and raster effects.

SVG must be cleaner and may use reduced geometry, but it must preserve the same pattern identity.

### VII. Testable Tasks

Each task must be implementable and testable independently.

Tasks should be small, ordered, and marked with `[P]` when parallelizable.

### VIII. Browser Compatibility

MVP must support modern Chromium-based browsers and Safari where practical.

The app must handle:

- missing WebGL;
- microphone permission denied;
- invalid audio file;
- too-large SVG export;
- unsupported browser APIs.

## Preferred Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- Web Audio API
- Three.js or React Three Fiber for raster preview
- Two.js or Paper.js for vector/SVG logic

## Forbidden for MVP

- authentication;
- payments;
- backend;
- cloud storage;
- marketplace;
- complex timeline editor;
- server-side rendering of videos;
- hidden proprietary export services.

## Quality Gates

Before implementation is considered complete:

1. `npm run typecheck` passes.
2. App loads without runtime errors.
3. Default visual is immediately visible.
4. Parameters change the pattern.
5. PNG export works.
6. SVG export works as native SVG.
7. Preset save/load works.
8. Large vector exports are guarded.
9. Audio mode fails gracefully if permission or file decoding fails.

## Governance

If implementation conflicts with this constitution, the constitution wins.

Changing the constitution requires updating:

- reason for change;
- affected spec sections;
- affected tasks;
- migration notes.
