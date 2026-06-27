---
name: spec-driven-development
description: Use this skill when implementing SonicField Studio from the existing Spec Kit documentation.
---

# Spec-Driven Development Skill

When working on this project, always follow the specification documents before writing code.

## Required reading order
1. `.specify/memory/constitution.md`
2. `specs/001-sonicfield-studio/spec.md`
3. `specs/001-sonicfield-studio/plan.md`
4. `specs/001-sonicfield-studio/tasks.md`
5. `docs/renderer-architecture.md`
6. `docs/export-rules.md`

## Rules
- Do not invent features outside the spec.
- Do not simplify raster/vector architecture into one renderer.
- Do not export SVG by screenshot tracing.
- Do not skip acceptance criteria.
- Do not implement backend, auth, payments, or cloud storage.

## Workflow
1. Read the current task.
2. Check which spec section supports it.
3. Implement only the needed files.
4. Run lint/typecheck/build when possible.
5. Report completed tasks and remaining tasks.
6. If implementation conflicts with the spec, stop and explain the conflict.

## Definition of done
A task is done only when:
- code compiles,
- behavior matches the spec,
- raster/vector boundaries are preserved,
- export behavior follows `docs/export-rules.md`,
- user-facing UI still matches the product vision.