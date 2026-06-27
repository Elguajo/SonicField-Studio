# AGENTS.md

## Project
SonicField Studio is a spec-driven web application for generating audio-driven raster and vector particle/wave patterns.

## Main rule
The agent must treat the specification files as the source of truth.

Read in this order:
1. `.specify/memory/constitution.md`
2. `specs/001-sonicfield-studio/spec.md`
3. `specs/001-sonicfield-studio/plan.md`
4. `specs/001-sonicfield-studio/tasks.md`
5. `prompts/implementation-prompt.md`

## Critical constraints
- Use one shared simulation engine.
- Raster preview and vector export must be separate renderers.
- SVG export must be generated from real geometry, not from raster screenshots.
- Do not build auth, payments, backend, cloud storage, or marketplace in MVP.
- Keep TypeScript strict and architecture clean.

## Implementation order
1. Build project shell.
2. Build state/store.
3. Build simulation engine.
4. Build raster renderer.
5. Build vector export.
6. Build audio engine.
7. Build presets.
8. Build import/export.
9. Add testing and validation.

## Quality bar
Every completed task must be checked against:
- specification
- plan
- task list
- export rules
- raster/vector separation