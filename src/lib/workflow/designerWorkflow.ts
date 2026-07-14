import { createSeededRandom } from "@/lib/simulation/seededRandom";
import type {
  ColorPalette,
  DesignVariation,
  DrawMode,
  ExportProfile,
  ExportSettings,
  GalleryItem,
  PatternMode,
  StudioParams
} from "@/types";

export const colorPalettes: ColorPalette[] = [
  {
    id: "electric-ink",
    name: "Electric Ink",
    backgroundColor: "#05070d",
    primaryColor: "#7dd3fc",
    secondaryColor: "#f5f7fb"
  },
  {
    id: "print-graphite",
    name: "Print Graphite",
    backgroundColor: "#f6f3ee",
    primaryColor: "#151515",
    secondaryColor: "#596068"
  },
  {
    id: "signal-red",
    name: "Signal Red",
    backgroundColor: "#12090a",
    primaryColor: "#ff4d5a",
    secondaryColor: "#ffd166"
  },
  {
    id: "mineral-green",
    name: "Mineral Green",
    backgroundColor: "#06110f",
    primaryColor: "#8ee6c8",
    secondaryColor: "#e7fff6"
  }
];

export const exportProfiles: ExportProfile[] = [
  {
    id: "poster-4x5",
    name: "Poster 4:5",
    rasterWidth: 2400,
    rasterHeight: 3000,
    maxSvgNodes: 12000,
    svgSimplification: 0.38,
    transparentBackground: false,
    includeSvgBackground: true
  },
  {
    id: "square-social",
    name: "Square Social",
    rasterWidth: 1600,
    rasterHeight: 1600,
    maxSvgNodes: 9000,
    svgSimplification: 0.42,
    transparentBackground: false,
    includeSvgBackground: true
  },
  {
    id: "wide-wallpaper",
    name: "Wide Wallpaper",
    rasterWidth: 2560,
    rasterHeight: 1440,
    maxSvgNodes: 15000,
    svgSimplification: 0.35,
    transparentBackground: false,
    includeSvgBackground: true
  },
  {
    id: "transparent-asset",
    name: "Transparent Asset",
    rasterWidth: 1800,
    rasterHeight: 1800,
    maxSvgNodes: 8000,
    svgSimplification: 0.5,
    transparentBackground: true,
    includeSvgBackground: false
  }
];

const variationPatternModes: PatternMode[] = [
  "wave-grid",
  "radial-cymatics",
  "lissajous",
  "sphere-field",
  "noise-flow"
];

export function applyPaletteToExportSettings(
  exportSettings: ExportSettings,
  palette: ColorPalette
): ExportSettings {
  return {
    ...exportSettings,
    backgroundColor: palette.backgroundColor
  };
}

export function applyExportProfile(
  exportSettings: ExportSettings,
  profile: ExportProfile,
  drawMode: DrawMode,
  backgroundColor: string
): ExportSettings {
  return {
    ...exportSettings,
    rasterWidth: profile.rasterWidth,
    rasterHeight: profile.rasterHeight,
    backgroundColor,
    transparentBackground: profile.transparentBackground,
    svgSimplification: profile.svgSimplification,
    maxSvgNodes: profile.maxSvgNodes,
    includeSvgBackground: profile.includeSvgBackground,
    drawMode
  };
}

export function createSeed(label: string, date = new Date()): string {
  return `${slug(label || "sonicfield")}-${date.getTime().toString(36)}`;
}

export function generateDesignVariations(input: {
  params: StudioParams;
  patternMode: PatternMode;
  seed: string;
  count?: number;
}): DesignVariation[] {
  const random = createSeededRandom(input.seed);
  const count = Math.max(1, Math.min(input.count ?? 4, 8));

  return Array.from({ length: count }, (_, index) => {
    const variationSeed = `${input.seed}-v${index + 1}`;
    const patternMode =
      index === 0
        ? input.patternMode
        : variationPatternModes[Math.floor(random() * variationPatternModes.length)] ?? input.patternMode;

    return {
      id: variationSeed,
      name: `Variation ${index + 1}`,
      patternMode,
      seed: variationSeed,
      params: {
        amplitude: clamp(input.params.amplitude * range(random, 0.72, 1.38), 0.2, 5),
        frequency: clamp(input.params.frequency + range(random, -3, 3), 0.1, 20),
        phase: wrapDegrees(input.params.phase + range(random, -90, 90)),
        speed: clamp(input.params.speed * range(random, 0.65, 1.35), 0, 5),
        density: clamp(input.params.density + range(random, -0.18, 0.18), 0.05, 1),
        particleSize: clamp(input.params.particleSize * range(random, 0.7, 1.45), 0.5, 12),
        noiseAmount: clamp(input.params.noiseAmount + range(random, -0.45, 0.7), 0, 5),
        symmetry: Math.round(clamp(input.params.symmetry + range(random, -3, 3), 1, 16)),
        vectorSimplification: clamp(input.params.vectorSimplification + range(random, -0.14, 0.18), 0, 1),
        pathSmoothing: clamp(input.params.pathSmoothing + range(random, -0.18, 0.18), 0, 1),
        bassInfluence: clamp(input.params.bassInfluence + range(random, -0.45, 0.75), 0, 5),
        midInfluence: clamp(input.params.midInfluence + range(random, -0.35, 0.55), 0, 5),
        highInfluence: clamp(input.params.highInfluence + range(random, -0.35, 0.55), 0, 5)
      }
    };
  });
}

export function createGalleryItem(input: {
  name: string;
  patternMode: PatternMode;
  drawMode: DrawMode;
  params: StudioParams;
  exportSettings: ExportSettings;
  paletteId: string;
  exportProfileId: string;
  seed: string;
  date?: Date;
}): GalleryItem {
  const date = input.date ?? new Date();

  return {
    id: `${input.seed}-${date.getTime().toString(36)}`,
    name: input.name.trim() || "Untitled Pattern",
    createdAt: date.toISOString(),
    patternMode: input.patternMode,
    drawMode: input.drawMode,
    params: input.params,
    exportSettings: input.exportSettings,
    paletteId: input.paletteId,
    exportProfileId: input.exportProfileId,
    seed: input.seed
  };
}

function range(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wrapDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
