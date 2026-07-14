import { describe, expect, it } from "vitest";
import { generatePatternGeometry, type GeneratePatternGeometryInput } from "@/lib/simulation/simulationEngine";
import type { AudioAnalysisFrame, PatternGeometry, PatternMode, StudioParams } from "@/types";

const baseParams: StudioParams = {
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

const emptyAudio: AudioAnalysisFrame = {
  volume: 0,
  bass: 0,
  mids: 0,
  highs: 0,
  waveform: [],
  frequency: []
};

const patternModes: PatternMode[] = [
  "wave-grid",
  "radial-cymatics",
  "lissajous",
  "sphere-field",
  "noise-flow"
];

describe("generatePatternGeometry", () => {
  it.each(patternModes)("generates renderer-independent geometry for %s", (patternMode) => {
    const geometry = generatePatternGeometry(createInput({ patternMode }));

    expect(geometry.points.length + geometry.paths.length).toBeGreaterThan(0);
    expect(geometry.meta.estimatedSvgNodeCount).toBe(geometry.points.length + geometry.paths.length);
    expect(geometry.meta.warnings).toEqual(expect.any(Array));
    expectGeometryIsFinite(geometry);
  });

  it("generates deterministic noise-flow geometry for the same seed", () => {
    const first = generatePatternGeometry(createInput({ patternMode: "noise-flow", seed: "poster-a" }));
    const second = generatePatternGeometry(createInput({ patternMode: "noise-flow", seed: "poster-a" }));
    const different = generatePatternGeometry(createInput({ patternMode: "noise-flow", seed: "poster-b" }));

    expect(first.points.slice(0, 12)).toEqual(second.points.slice(0, 12));
    expect(first.points.slice(0, 12)).not.toEqual(different.points.slice(0, 12));
  });

  it("normalizes invalid numeric inputs so exported geometry stays finite", () => {
    const geometry = generatePatternGeometry(
      createInput({
        width: Number.NaN,
        height: Number.POSITIVE_INFINITY,
        time: Number.NaN,
        params: {
          ...baseParams,
          amplitude: Number.NaN,
          frequency: Number.POSITIVE_INFINITY,
          density: Number.POSITIVE_INFINITY,
          symmetry: Number.NaN
        },
        audio: {
          ...emptyAudio,
          volume: Number.NaN,
          bass: Number.POSITIVE_INFINITY,
          waveform: [0, Number.NaN],
          frequency: [0, Number.POSITIVE_INFINITY]
        }
      })
    );

    expect(geometry.points.length + geometry.paths.length).toBeGreaterThan(0);
    expectGeometryIsFinite(geometry);
  });

  it("warns when generated geometry is too heavy for default vector export limits", () => {
    const geometry = generatePatternGeometry(
      createInput({
        patternMode: "noise-flow",
        params: {
          ...baseParams,
          density: 1
        }
      })
    );

    expect(geometry.meta.estimatedSvgNodeCount).toBeGreaterThan(15000);
    expect(geometry.meta.warning).toContain("High SVG node count");
    expect(geometry.meta.warnings).toContain("High SVG node count. Vector export should simplify or sample this geometry.");
  });
});

function createInput(overrides: Partial<GeneratePatternGeometryInput>): GeneratePatternGeometryInput {
  return {
    params: baseParams,
    patternMode: "radial-cymatics",
    width: 960,
    height: 720,
    time: 0.5,
    audio: emptyAudio,
    seed: "sonicfield-test",
    ...overrides
  };
}

function expectGeometryIsFinite(geometry: PatternGeometry): void {
  for (const point of geometry.points) {
    expectPointIsFinite(point);
  }

  for (const path of geometry.paths) {
    for (const point of path.points) {
      expectPointIsFinite(point);
    }
  }
}

function expectPointIsFinite(point: { x: number; y: number; z?: number; size?: number; value?: number }): void {
  expect(Number.isFinite(point.x)).toBe(true);
  expect(Number.isFinite(point.y)).toBe(true);
  if (point.z !== undefined) expect(Number.isFinite(point.z)).toBe(true);
  if (point.size !== undefined) expect(Number.isFinite(point.size)).toBe(true);
  if (point.value !== undefined) expect(Number.isFinite(point.value)).toBe(true);
}
