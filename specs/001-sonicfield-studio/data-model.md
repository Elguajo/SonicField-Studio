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
  bassInfluence: number;
  midInfluence: number;
  highInfluence: number;
}
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
}
```

## ExportSettings

```ts
interface ExportSettings {
  rasterWidth: number;
  rasterHeight: number;
  svgWidth: number;
  svgHeight: number;
  backgroundColor: string;
  transparentBackground: boolean;
  maxSvgNodes: number;
  includeSvgBackground: boolean;
}
```
