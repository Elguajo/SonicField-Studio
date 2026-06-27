# Implementation Prompt for AI Coding Agent

You are a senior frontend engineer and creative coding developer.

Build SonicField Studio according to the Spec Kit files in this repository.

Before coding, read:

1. `.specify/memory/constitution.md`
2. `specs/001-sonicfield-studio/spec.md`
3. `specs/001-sonicfield-studio/plan.md`
4. `specs/001-sonicfield-studio/data-model.md`
5. `specs/001-sonicfield-studio/tasks.md`

## Non-negotiable Rules

- Do not build authentication.
- Do not build payments.
- Do not build backend.
- Do not add cloud storage.
- Do not generate SVG by tracing or embedding raster screenshots.
- Do not duplicate pattern logic inside renderers.
- Do not make audio start automatically on page load.

## Implementation Order

Follow `tasks.md` phase by phase.

Start with:

1. Type system
2. Store
3. Simulation engine
4. Canvas preview
5. Controls
6. SVG export
7. PNG export
8. Presets
9. Audio input
10. Polish

## Expected Result

The MVP must allow a designer to:

- open the app;
- see a beautiful default pattern;
- adjust parameters;
- switch pattern mode;
- export PNG;
- export native SVG;
- save/load JSON preset;
- use audio to influence the pattern.

## Quality Gate

Before saying the task is complete:

```bash
npm run typecheck
npm run build
```

Then update completed checkboxes in:

```txt
specs/001-sonicfield-studio/tasks.md
```
