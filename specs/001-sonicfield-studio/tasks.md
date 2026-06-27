# Tasks: SonicField Studio MVP

## Phase 0: Project Validation

- [x] T001 Confirm project runs with `npm install` and `npm run dev`.
- [x] T002 Confirm TypeScript strict mode is enabled.
- [x] T003 Confirm all core docs are present in `.specify/` and `specs/001-sonicfield-studio/`.
- [x] T004 Confirm no backend/auth/payment dependencies are added.

---

## Phase 1: Foundation

- [x] T005 Define complete domain types in `src/types/index.ts`.
- [x] T006 Create Zustand store with output mode, pattern mode, params, export actions, and errors.
- [x] T007 Create base app layout with TopBar, Viewport, and ControlPanel.
- [x] T008 Add responsive desktop layout.
- [x] T009 Add accessible labels for all controls.
- [x] T010 Add visual error/warning area in UI.

---

## Phase 2: Simulation Engine

- [x] T011 Implement renderer-independent `generatePatternGeometry()`.
- [x] T012 Implement Wave Grid pattern.
- [x] T013 Implement Radial Cymatics pattern.
- [x] T014 Implement Lissajous pattern.
- [x] T015 Implement Sphere Field pattern.
- [x] T016 Implement Noise Flow pattern.
- [x] T017 Add geometry metadata: estimated SVG node count and warnings.
- [x] T018 Add deterministic seeded random helper for reproducible presets.
- [x] T019 Add unit tests for geometry generation.
- [x] T020 Validate geometry output has no NaN values.

---

## Phase 3: Raster Preview

- [x] T021 Implement Canvas 2D raster renderer for MVP.
- [x] T022 Make renderer consume only simulation geometry.
- [x] T023 Add opt-in animation loop with static preview as the default.
- [x] T024 Add viewport resize handling.
- [x] T025 Add basic path drawing.
- [x] T026 Add point rendering.
- [x] T027 Add optional glow/trail approximation.
- [x] T028 Ensure parameter changes update preview immediately.
- [x] T029 Add fallback message if canvas context fails.
- [x] T029A Add line/particle/both draw mode control.
- [x] T029B Make raster renderer respect selected draw mode.

---

## Phase 4: Vector Export

- [x] T030 Implement SVG export from geometry.
- [x] T031 Add SVG groups for points and paths.
- [x] T032 Add metadata inside SVG: title, description, app name.
- [x] T033 Add max node limit.
- [x] T034 Add point sampling.
- [x] T035 Add path sampling.
- [x] T036 Add vector simplification parameter.
- [x] T037 Add warning when SVG estimate is too high.
- [x] T038 Add download helper for SVG file.
- [x] T038A Make SVG export respect selected draw mode.
- [ ] T039 Test SVG opens in browser.
- [ ] T040 Test SVG opens in Illustrator/Figma/Inkscape if available.

---

## Phase 5: PNG Export

- [x] T041 Implement PNG export from active canvas.
- [x] T042 Add export filename generator.
- [x] T043 Add support for transparent background flag.
- [x] T044 Add export success/error feedback.
- [x] T045 Validate PNG visually matches current preview.

---

## Phase 6: Presets

- [x] T046 Define preset schema.
- [x] T047 Add at least 6 built-in presets.
- [x] T048 Add preset selector.
- [x] T049 Add preset apply action.
- [x] T050 Add randomize action with safe ranges.
- [x] T051 Add reset action.
- [x] T052 Implement JSON preset export.
- [x] T053 Implement JSON preset import.
- [x] T054 Validate imported JSON against schema.
- [x] T055 Show clear error for invalid preset.
- [x] T055A Persist draw mode and animation preference in preset JSON.

---

## Phase 7: Audio Engine

- [x] T056 Implement AudioEngine wrapper.
- [x] T057 Initialize AudioContext only after user interaction.
- [x] T058 Implement AnalyserNode frequency data.
- [x] T059 Implement AnalyserNode waveform data.
- [x] T060 Calculate volume, bass, mids, highs.
- [x] T061 Implement built-in oscillator.
- [x] T062 Implement oscillator waveform type selector.
- [x] T063 Implement audio file upload and looping playback.
- [x] T064 Implement microphone input.
- [x] T065 Handle microphone permission denied.
- [x] T066 Handle audio decode failure.
- [x] T067 Map audio frame values to simulation engine.
- [x] T068 Add smoothing for audio values.

---

## Phase 8: UI Polish

- [x] T069 Improve visual design of control panel.
- [x] T070 Add tooltip/helper text for raster vs vector difference.
- [x] T071 Add current audio source indicator.
- [x] T072 Add export settings panel.
- [x] T073 Add visual warning for vector-heavy scenes.
- [x] T074 Add loading/disabled states.
- [ ] T075 Add keyboard navigation checks.
- [x] T076 Add empty/error states.

---

## Phase 9: QA

- [x] T077 Run `npm run typecheck`.
- [x] T078 Run `npm run build`.
- [x] T079 Test default load.
- [x] T080 Test every pattern mode.
- [ ] T081 Test all sliders.
- [ ] T082 Test PNG export.
- [ ] T083 Test SVG export.
- [x] T084 Test preset export/import.
- [ ] T085 Test audio file input.
- [ ] T086 Test microphone denied flow.
- [x] T087 Test high-density vector warning.
- [x] T088 Review implementation against constitution.

---

## Parallelizable Tasks

These tasks can be done in parallel after Phase 1:

- [P] T012 Wave Grid
- [P] T013 Radial Cymatics
- [P] T014 Lissajous
- [P] T015 Sphere Field
- [P] T016 Noise Flow
- [P] T046 Preset schema
- [P] T056 AudioEngine wrapper
- [P] T030 SVG export

---

## Definition of Done

MVP is done when:

- Default visual loads.
- Controls work.
- At least 5 pattern modes work.
- PNG export works.
- SVG export is native vector.
- JSON presets work.
- Audio analysis affects geometry.
- App has no backend/auth/payment.
- Spec and tasks are updated to reflect implementation.
