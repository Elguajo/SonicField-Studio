import type { ExportSettings, PatternMode, StudioParams, StudioPresetSnapshot } from "@/types";

export const PRESET_SCHEMA_VERSION = "1.0";

export interface StudioPreset {
  id: string;
  name: string;
  patternMode: PatternMode;
  params: StudioParams;
}

export const presets: StudioPreset[] = [
  {
    id: "soft-sine-grid",
    name: "Soft Sine Grid",
    patternMode: "wave-grid",
    params: {
      amplitude: 1.2,
      frequency: 4,
      phase: 0,
      speed: 0.8,
      density: 0.35,
      particleSize: 2,
      noiseAmount: 0.1,
      symmetry: 4,
      vectorSimplification: 0.35,
      pathSmoothing: 0.74,
      bassInfluence: 0.8,
      midInfluence: 0.5,
      highInfluence: 0.3
    }
  },
  {
    id: "neon-cymatics",
    name: "Neon Cymatics",
    patternMode: "radial-cymatics",
    params: {
      amplitude: 2.4,
      frequency: 8,
      phase: 45,
      speed: 1.1,
      density: 0.55,
      particleSize: 1.8,
      noiseAmount: 0.25,
      symmetry: 8,
      vectorSimplification: 0.4,
      pathSmoothing: 0.78,
      bassInfluence: 1.5,
      midInfluence: 0.8,
      highInfluence: 0.6
    }
  },
  {
    id: "minimal-lissajous",
    name: "Minimal Lissajous",
    patternMode: "lissajous",
    params: {
      amplitude: 1,
      frequency: 3,
      phase: 90,
      speed: 0.5,
      density: 0.4,
      particleSize: 1.2,
      noiseAmount: 0,
      symmetry: 5,
      vectorSimplification: 0.2,
      pathSmoothing: 0.86,
      bassInfluence: 0.4,
      midInfluence: 0.7,
      highInfluence: 0.4
    }
  },
  {
    id: "orbital-sphere",
    name: "Orbital Sphere",
    patternMode: "sphere-field",
    params: {
      amplitude: 1.6,
      frequency: 7,
      phase: 18,
      speed: 0.9,
      density: 0.48,
      particleSize: 1.4,
      noiseAmount: 0.2,
      symmetry: 9,
      vectorSimplification: 0.5,
      pathSmoothing: 0.7,
      bassInfluence: 1,
      midInfluence: 0.9,
      highInfluence: 0.6
    }
  },
  {
    id: "contour-flow",
    name: "Contour Flow",
    patternMode: "noise-flow",
    params: {
      amplitude: 2.2,
      frequency: 5,
      phase: 120,
      speed: 0.7,
      density: 0.45,
      particleSize: 1,
      noiseAmount: 1.4,
      symmetry: 5,
      vectorSimplification: 0.55,
      pathSmoothing: 0.64,
      bassInfluence: 0.9,
      midInfluence: 1.2,
      highInfluence: 0.8
    }
  },
  {
    id: "poster-rings",
    name: "Poster Rings",
    patternMode: "radial-cymatics",
    params: {
      amplitude: 3.2,
      frequency: 11,
      phase: 210,
      speed: 0.35,
      density: 0.32,
      particleSize: 2.4,
      noiseAmount: 0.05,
      symmetry: 12,
      vectorSimplification: 0.25,
      pathSmoothing: 0.82,
      bassInfluence: 1.8,
      midInfluence: 0.5,
      highInfluence: 0.2
    }
  }
];

export function createPresetSnapshot(input: {
  name: string;
  patternMode: PatternMode;
  params: StudioParams;
  exportSettings: ExportSettings;
  drawMode?: StudioPresetSnapshot["drawMode"];
  animatePreview?: boolean;
  paletteId?: string;
  exportProfileId?: string;
  seed?: string;
}): StudioPresetSnapshot {
  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    name: input.name.trim() || "Untitled Preset",
    patternMode: input.patternMode,
    params: input.params,
    exportSettings: input.exportSettings,
    drawMode: input.drawMode ?? input.exportSettings.drawMode,
    animatePreview: input.animatePreview ?? false,
    paletteId: input.paletteId,
    exportProfileId: input.exportProfileId,
    seed: input.seed
  };
}

export function parsePresetJson(contents: string): StudioPresetSnapshot {
  let value: unknown;

  try {
    value = JSON.parse(contents);
  } catch {
    throw new Error("Invalid preset JSON.");
  }

  return validatePresetSnapshot(value);
}

function validatePresetSnapshot(value: unknown): StudioPresetSnapshot {
  if (!isRecord(value)) {
    throw new Error("Preset file must contain an object.");
  }

  if (value.schemaVersion !== PRESET_SCHEMA_VERSION) {
    throw new Error("Unsupported preset schema version.");
  }

  if (typeof value.name !== "string" || value.name.trim().length === 0) {
    throw new Error("Preset name is required.");
  }

  if (!isPatternMode(value.patternMode)) {
    throw new Error("Preset pattern mode is invalid.");
  }

  const params = validateParams(value.params);
  const exportSettings = isRecord(value.exportSettings) ? validateExportSettings(value.exportSettings) : undefined;
  const drawMode = isDrawMode(value.drawMode) ? value.drawMode : exportSettings?.drawMode ?? "both";

  return {
    schemaVersion: PRESET_SCHEMA_VERSION,
    name: value.name,
    patternMode: value.patternMode,
    params,
    exportSettings: exportSettings ?? {
      rasterWidth: 1200,
      rasterHeight: 900,
      backgroundColor: "#05070d",
      transparentBackground: false,
      svgSimplification: params.vectorSimplification,
      maxSvgNodes: 15000,
      includeSvgBackground: true,
      drawMode
    },
    drawMode,
    animatePreview: typeof value.animatePreview === "boolean" ? value.animatePreview : false,
    paletteId: typeof value.paletteId === "string" ? value.paletteId : undefined,
    exportProfileId: typeof value.exportProfileId === "string" ? value.exportProfileId : undefined,
    seed: typeof value.seed === "string" ? value.seed : undefined
  };
}

function validateParams(value: unknown): StudioParams {
  if (!isRecord(value)) {
    throw new Error("Preset params are required.");
  }

  return {
    amplitude: numberInRange(value.amplitude, "amplitude", 0, 5),
    frequency: numberInRange(value.frequency, "frequency", 0.1, 20),
    phase: numberInRange(value.phase, "phase", 0, 360),
    speed: numberInRange(value.speed, "speed", 0, 5),
    density: numberInRange(value.density, "density", 0.05, 1),
    particleSize: numberInRange(value.particleSize, "particleSize", 0.5, 12),
    noiseAmount: numberInRange(value.noiseAmount, "noiseAmount", 0, 5),
    symmetry: integerInRange(value.symmetry, "symmetry", 1, 16),
    vectorSimplification: numberInRange(value.vectorSimplification, "vectorSimplification", 0, 1),
    pathSmoothing: numberInRange(value.pathSmoothing ?? 0.72, "pathSmoothing", 0, 1),
    bassInfluence: numberInRange(value.bassInfluence ?? 1, "bassInfluence", 0, 5),
    midInfluence: numberInRange(value.midInfluence ?? 0.75, "midInfluence", 0, 5),
    highInfluence: numberInRange(value.highInfluence ?? 0.5, "highInfluence", 0, 5)
  };
}

function validateExportSettings(value: Record<string, unknown>): ExportSettings {
  return {
    rasterWidth: integerInRange(value.rasterWidth ?? 1200, "rasterWidth", 1, 10000),
    rasterHeight: integerInRange(value.rasterHeight ?? 900, "rasterHeight", 1, 10000),
    backgroundColor: typeof value.backgroundColor === "string" ? value.backgroundColor : "#05070d",
    transparentBackground: typeof value.transparentBackground === "boolean" ? value.transparentBackground : false,
    svgSimplification: numberInRange(value.svgSimplification ?? 0.35, "svgSimplification", 0, 1),
    maxSvgNodes: integerInRange(value.maxSvgNodes ?? 15000, "maxSvgNodes", 1, 100000),
    includeSvgBackground: typeof value.includeSvgBackground === "boolean" ? value.includeSvgBackground : true,
    drawMode: isDrawMode(value.drawMode) ? value.drawMode : "both"
  };
}

function isPatternMode(value: unknown): value is PatternMode {
  return (
    value === "wave-grid" ||
    value === "radial-cymatics" ||
    value === "lissajous" ||
    value === "sphere-field" ||
    value === "noise-flow"
  );
}

function isDrawMode(value: unknown): value is NonNullable<StudioPresetSnapshot["drawMode"]> {
  return value === "lines" || value === "particles" || value === "both";
}

function numberInRange(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Preset ${label} must be a number from ${min} to ${max}.`);
  }

  return value;
}

function integerInRange(value: unknown, label: string, min: number, max: number): number {
  const number = numberInRange(value, label, min, max);

  if (!Number.isInteger(number)) {
    throw new Error(`Preset ${label} must be an integer.`);
  }

  return number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
