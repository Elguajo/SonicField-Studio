# Data Model: SonicField Studio

## StudioParams

```ts
interface StudioParams {
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  density: number;
  particleSize: number;
  noiseAmount: number;
  symmetry: number;
  vectorSimplification: number;
  pathSmoothing: number;
  bassInfluence: number;
  midInfluence: number;
  highInfluence: number;
}
```

## DrawMode

```ts
type DrawMode = "lines" | "particles" | "both";
```

## AudioAnalysisFrame

```ts
interface AudioAnalysisFrame {
  volume: number;
  bass: number;
  mids: number;
  highs: number;
  waveform: number[];
  frequency: number[];
}
```

## PatternGeometry

```ts
interface PatternGeometry {
  points: GeometryPoint[];
  paths: GeometryPath[];
  meta: {
    estimatedSvgNodeCount: number;
    warnings: string[];
    warning?: string;
  };
}
```

## StudioPreset

```ts
interface StudioPreset {
  schemaVersion: "1.0";
  id: string;
  name: string;
  patternMode: PatternMode;
  params: StudioParams;
  exportSettings: ExportSettings;
  drawMode?: DrawMode;
  animatePreview?: boolean;
  seed?: string;
}
```

## ExportSettings

```ts
interface ExportSettings {
  rasterWidth: number;
  rasterHeight: number;
  backgroundColor: string;
  transparentBackground: boolean;
  svgSimplification: number;
  maxSvgNodes: number;
  includeSvgBackground: boolean;
  drawMode: DrawMode;
}
```
