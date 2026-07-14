import { describe, expect, it } from "vitest";
import {
  applyExportProfile,
  applyPaletteToExportSettings,
  colorPalettes,
  createGalleryItem,
  exportProfiles,
  generateDesignVariations
} from "@/lib/workflow/designerWorkflow";
import type { ExportSettings, StudioParams } from "@/types";

const params: StudioParams = {
  amplitude: 1.8,
  frequency: 6,
  phase: 0,
  speed: 1,
  density: 0.35,
  particleSize: 2,
  noiseAmount: 0.3,
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

describe("designer workflow", () => {
  it("applies palettes without changing export dimensions", () => {
    const palette = colorPalettes[1];
    const next = applyPaletteToExportSettings(exportSettings, palette);

    expect(next.backgroundColor).toBe(palette.backgroundColor);
    expect(next.rasterWidth).toBe(exportSettings.rasterWidth);
    expect(next.rasterHeight).toBe(exportSettings.rasterHeight);
  });

  it("applies export profiles while preserving draw mode and palette background", () => {
    const profile = exportProfiles[0];
    const next = applyExportProfile(exportSettings, profile, "particles", "#111111");

    expect(next.rasterWidth).toBe(profile.rasterWidth);
    expect(next.rasterHeight).toBe(profile.rasterHeight);
    expect(next.drawMode).toBe("particles");
    expect(next.backgroundColor).toBe("#111111");
  });

  it("generates deterministic bounded variations", () => {
    const first = generateDesignVariations({
      params,
      patternMode: "radial-cymatics",
      seed: "locked-seed"
    });
    const second = generateDesignVariations({
      params,
      patternMode: "radial-cymatics",
      seed: "locked-seed"
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(4);
    expect(first[0].params.density).toBeGreaterThanOrEqual(0.05);
    expect(first[0].params.density).toBeLessThanOrEqual(1);
    expect(first[0].params.symmetry).toBeGreaterThanOrEqual(1);
    expect(first[0].params.symmetry).toBeLessThanOrEqual(16);
  });

  it("creates restorable gallery snapshots", () => {
    const item = createGalleryItem({
      name: "  Poster Take  ",
      patternMode: "noise-flow",
      drawMode: "lines",
      params,
      exportSettings,
      paletteId: "electric-ink",
      exportProfileId: "poster-4x5",
      seed: "poster-seed",
      date: new Date("2026-06-27T00:00:00.000Z")
    });

    expect(item.name).toBe("Poster Take");
    expect(item.createdAt).toBe("2026-06-27T00:00:00.000Z");
    expect(item.patternMode).toBe("noise-flow");
    expect(item.drawMode).toBe("lines");
  });
});
