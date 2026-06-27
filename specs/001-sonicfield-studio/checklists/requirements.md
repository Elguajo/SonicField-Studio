# Requirements Checklist

## Product

- [ ] App opens without login.
- [ ] Default visual is visible immediately.
- [ ] User can control wave parameters.
- [ ] User can switch pattern modes.
- [ ] User can export PNG.
- [ ] User can export SVG.
- [ ] User can save/load JSON preset.

## Raster

- [ ] Raster preview is responsive.
- [ ] Raster output supports dense patterns.
- [ ] PNG export matches preview.

## Vector

- [ ] SVG is generated from geometry.
- [ ] SVG is not raster traced.
- [ ] SVG has density/simplification limit.
- [ ] SVG opens in browser.
- [ ] SVG is logically editable.

## Audio

- [ ] AudioContext starts only after user interaction.
- [ ] Uploaded audio works.
- [ ] Microphone input works or fails gracefully.
- [ ] Bass/mids/highs/volume are calculated.
- [ ] Audio affects geometry.

## Technical

- [ ] Simulation engine has no renderer-specific logic.
- [ ] Renderers consume geometry only.
- [ ] TypeScript strict mode passes.
- [ ] No backend.
- [ ] No auth.
- [ ] No payments.
