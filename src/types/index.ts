export type OutputMode = "raster" | "vector";

export type PatternMode =
  | "wave-grid"
  | "radial-cymatics"
  | "lissajous"
  | "sphere-field"
  | "noise-flow";

export type AudioSource = "none" | "oscillator" | "file" | "microphone";

export type NoticeLevel = "info" | "warning" | "error" | "success";

export interface StudioParams {
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  density: number;
  particleSize: number;
  noiseAmount: number;
  symmetry: number;
  vectorSimplification: number;
  bassInfluence: number;
  midInfluence: number;
  highInfluence: number;
}

export type StudioParameterKey = keyof StudioParams;

export interface ExportSettings {
  rasterWidth: number;
  rasterHeight: number;
  backgroundColor: string;
  transparentBackground: boolean;
  svgSimplification: number;
  maxSvgNodes: number;
  includeSvgBackground: boolean;
}

export interface StudioNotice {
  id: string;
  level: NoticeLevel;
  message: string;
}

export interface StudioPresetSnapshot {
  schemaVersion: "1.0";
  name: string;
  patternMode: PatternMode;
  params: StudioParams;
  exportSettings: ExportSettings;
  seed?: string;
}

export interface AudioAnalysisFrame {
  volume: number;
  bass: number;
  mids: number;
  highs: number;
  waveform: number[];
  frequency: number[];
}

export interface GeometryPoint {
  x: number;
  y: number;
  z?: number;
  size?: number;
  value?: number;
}

export interface GeometryPath {
  id: string;
  points: GeometryPoint[];
  closed?: boolean;
}

export interface PatternGeometry {
  points: GeometryPoint[];
  paths: GeometryPath[];
  meta: {
    estimatedSvgNodeCount: number;
    warnings: string[];
    warning?: string;
  };
}
