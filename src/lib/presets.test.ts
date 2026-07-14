import { describe, expect, it } from "vitest";
import { createPresetSnapshot, parsePresetJson, presets } from "@/lib/presets";
import type { ExportSettings, StudioParams } from "@/types";

const params: StudioParams = {
  amplitude: 1,
  frequency: 5,
  phase: 45,
  speed: 1,
  density: 0.4,
  particleSize: 2,
  noiseAmount: 0.2,
  symmetry: 6,
  vectorSimplification: 0.35,
  pathSmoothing: 0.72,
  bassInfluence: 1,
  midInfluence: 0.75,
  highInfluence: 0.5,
  order: 0
};

const exportSettings: ExportSettings = {
  rasterWidth: 1200,
  rasterHeight: 900,
  backgroundColor: "#05070d",
  transparentBackground: false,
  svgSimplification: 0.35,
  maxSvgNodes: 15000,
  includeSvgBackground: true,
  drawMode: "both"
};

describe("presets", () => {
  it("provides at least six built-in presets", () => {
    expect(presets.length).toBeGreaterThanOrEqual(6);
  });

  it("round-trips a preset snapshot through JSON", () => {
    const snapshot = createPresetSnapshot({
      name: "Poster Test",
      patternMode: "radial-cymatics",
      params,
      exportSettings,
      drawMode: "particles",
      animatePreview: true,
      paletteId: "electric-ink",
      exportProfileId: "poster-4x5",
      seed: "poster-test"
    });

    expect(parsePresetJson(JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it("rejects invalid JSON", () => {
    expect(() => parsePresetJson("{")).toThrow("Invalid preset JSON.");
  });

  it("keeps old preset JSON valid when workflow fields are missing", () => {
    const snapshot = {
      schemaVersion: "1.0",
      name: "Legacy Preset",
      patternMode: "wave-grid",
      params,
      exportSettings
    };

    expect(parsePresetJson(JSON.stringify(snapshot))).toMatchObject({
      name: "Legacy Preset",
      drawMode: "both",
      animatePreview: false
    });
  });

  it("rejects out-of-range preset params", () => {
    const snapshot = createPresetSnapshot({
      name: "Broken",
      patternMode: "wave-grid",
      params: {
        ...params,
        density: 2
      },
      exportSettings
    });

    expect(() => parsePresetJson(JSON.stringify(snapshot))).toThrow("Preset density");
  });
});
