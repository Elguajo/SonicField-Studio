import { seedToOffset } from "@/lib/simulation/seededRandom";
import type { AudioAnalysisFrame, GeometryPath, GeometryPoint, PatternGeometry, PatternMode, StudioParams } from "@/types";

export interface GeneratePatternGeometryInput {
  params: StudioParams;
  patternMode: PatternMode;
  width: number;
  height: number;
  time: number;
  audio: AudioAnalysisFrame;
  seed?: string;
}

export function generatePatternGeometry(input: GeneratePatternGeometryInput): PatternGeometry {
  const safeInput = normalizeInput(input);

  switch (safeInput.patternMode) {
    case "wave-grid":
      return generateWaveGrid(safeInput);
    case "lissajous":
      return generateLissajous(safeInput);
    case "sphere-field":
      return generateSphereField(safeInput);
    case "noise-flow":
      return generateNoiseFlow(safeInput);
    case "radial-cymatics":
    default:
      return generateRadialCymatics(safeInput);
  }
}

function generateWaveGrid({ params, width, height, time, audio }: GeneratePatternGeometryInput): PatternGeometry {
  const points: GeometryPoint[] = [];
  const columns = Math.round(18 + params.density * 90);
  const rows = Math.round(12 + params.density * 60);
  const cx = width / 2;
  const cy = height / 2;
  const audioBoost = 1 + audio.volume * params.bassInfluence;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const u = x / Math.max(1, columns - 1);
      const v = y / Math.max(1, rows - 1);
      const px = u * width;
      const py = v * height;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / Math.max(width, height);
      const wave = Math.sin(dist * params.frequency * Math.PI * 2 - time * params.speed + deg(params.phase));
      points.push({
        x: px,
        y: py + wave * params.amplitude * 32 * audioBoost,
        value: wave
      });
    }
  }

  return withMeta({ points, paths: [] });
}

function generateRadialCymatics({ params, width, height, time, audio, seed }: GeneratePatternGeometryInput): PatternGeometry {
  const points: GeometryPoint[] = [];
  const paths: GeometryPath[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.42;
  const rings = Math.round(8 + params.density * 34);
  const phase = deg(params.phase);
  const audioBoost = 1 + audio.bass * params.bassInfluence;
  const seedOffset = seedToOffset(seedKey(params, "radial-cymatics", seed));

  for (let r = 1; r <= rings; r++) {
    const ringPoints: GeometryPoint[] = [];
    const normalizedRing = r / rings;
    const baseRadius = normalizedRing * maxRadius;
    const segments = Math.round(32 + params.density * 280 * normalizedRing);

    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const radialWave =
        Math.sin(t * params.symmetry + time * params.speed + phase) *
        params.amplitude *
        18 *
        (1 - normalizedRing * 0.25) *
        audioBoost;

      const noise = pseudoNoise(t * params.frequency + seedOffset, normalizedRing * 10, time) * params.noiseAmount * 12;
      const radius = baseRadius + radialWave + noise;

      const point = {
        x: cx + Math.cos(t) * radius,
        y: cy + Math.sin(t) * radius,
        value: radialWave
      };

      snapToPolarGrid(point, params.order, cx, cy, params.symmetry * 4, maxRadius / rings);
      points.push(point);
      ringPoints.push(point);
    }

    paths.push({
      id: `ring-${r}`,
      points: ringPoints,
      closed: true
    });
  }

  return withMeta({ points, paths });
}

function generateLissajous({ params, width, height, time }: GeneratePatternGeometryInput): PatternGeometry {
  const points: GeometryPoint[] = [];
  const pathPoints: GeometryPoint[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const count = Math.round(250 + params.density * 4000);
  const scale = Math.min(width, height) * 0.35;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const x = cx + Math.sin(params.frequency * t + deg(params.phase) + time * params.speed) * scale;
    const y = cy + Math.sin((params.symmetry || 1) * t) * scale;
    const point = { x, y, value: i / count };
    points.push(point);
    pathPoints.push(point);
  }

  return withMeta({
    points,
    paths: [{ id: "lissajous-main", points: pathPoints, closed: true }]
  });
}

function generateSphereField({ params, width, height, time, audio }: GeneratePatternGeometryInput): PatternGeometry {
  const points: GeometryPoint[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const count = Math.round(500 + params.density * 9000);
  const radius = Math.min(width, height) * 0.32;
  const boost = 1 + audio.volume * 0.8;

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const wave = Math.sin(theta * params.symmetry + time * params.speed + deg(params.phase));
    const r = radius + wave * params.amplitude * 16 * boost;
    const x3 = Math.cos(theta) * Math.sin(phi) * r;
    const y3 = Math.sin(theta) * Math.sin(phi) * r;
    const z3 = Math.cos(phi) * r;
    const perspective = 1 / (1 + z3 / 1200);
    const point = {
      x: cx + x3 * perspective,
      y: cy + y3 * perspective,
      z: z3,
      value: wave
    };

    snapToPolarGrid(point, params.order, cx, cy, Math.max(12, params.symmetry * 3), radius / 8);
    points.push(point);
  }

  return withMeta({ points, paths: [] });
}

function generateNoiseFlow({ params, width, height, time, seed }: GeneratePatternGeometryInput): PatternGeometry {
  const points: GeometryPoint[] = [];
  const paths: GeometryPath[] = [];
  const lines = Math.round(40 + params.density * 240);
  const steps = Math.round(10 + params.density * 70);
  const seedOffset = seedToOffset(seedKey(params, "noise-flow", seed));

  for (let i = 0; i < lines; i++) {
    const startX = (i / Math.max(1, lines - 1)) * width;
    let x = startX;
    let y = height * 0.5 + Math.sin(i * 0.37) * height * 0.25;
    const pathPoints: GeometryPoint[] = [];

    for (let s = 0; s < steps; s++) {
      const n = pseudoNoise(x * 0.004 * params.frequency + seedOffset, y * 0.004, time * params.speed);
      const angle = n * Math.PI * 2 * params.symmetry;
      x += Math.cos(angle) * (4 + params.amplitude * 3);
      y += Math.sin(angle) * (4 + params.amplitude * 3);
      const point = { x, y, value: n };
      points.push(point);
      pathPoints.push(point);
    }

    paths.push({ id: `flow-${i}`, points: pathPoints });
  }

  return withMeta({ points, paths });
}

function snapToPolarGrid(
  point: GeometryPoint,
  order: number,
  cx: number,
  cy: number,
  angularSteps: number,
  radialStep: number
): void {
  if (order <= 0) return;

  const dx = point.x - cx;
  const dy = point.y - cy;
  const radius = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const angularStepSize = (Math.PI * 2) / Math.max(3, Math.round(angularSteps));
  const snappedAngle = Math.round(angle / angularStepSize) * angularStepSize;
  const snappedRadiusStep = Math.max(1, radialStep);
  const snappedRadius = Math.round(radius / snappedRadiusStep) * snappedRadiusStep;

  point.x = lerp(point.x, cx + Math.cos(snappedAngle) * snappedRadius, order);
  point.y = lerp(point.y, cy + Math.sin(snappedAngle) * snappedRadius, order);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function withMeta(input: Omit<PatternGeometry, "meta">): PatternGeometry {
  const { points, paths, sanitizedCount } = sanitizeGeometry(input);
  const estimatedSvgNodeCount = points.length + paths.length;
  const warnings = [
    ...(estimatedSvgNodeCount > 15000
      ? ["High SVG node count. Vector export should simplify or sample this geometry."]
      : []),
    ...(sanitizedCount > 0 ? [`Sanitized ${sanitizedCount} invalid geometry values.`] : [])
  ];

  return {
    points,
    paths,
    meta: {
      estimatedSvgNodeCount,
      warnings,
      warning: warnings[0]
    }
  };
}

function normalizeInput(input: GeneratePatternGeometryInput): GeneratePatternGeometryInput {
  return {
    ...input,
    width: Math.max(1, finiteNumber(input.width, 1200)),
    height: Math.max(1, finiteNumber(input.height, 900)),
    time: finiteNumber(input.time, 0),
    seed: input.seed ?? "sonicfield-default",
    params: {
      amplitude: clamp(finiteNumber(input.params.amplitude, 1.8), 0, 8),
      frequency: clamp(finiteNumber(input.params.frequency, 6), 0.1, 32),
      phase: finiteNumber(input.params.phase, 0),
      speed: clamp(finiteNumber(input.params.speed, 1), 0, 8),
      density: clamp(finiteNumber(input.params.density, 0.35), 0.01, 1),
      particleSize: clamp(finiteNumber(input.params.particleSize, 2), 0.25, 24),
      noiseAmount: clamp(finiteNumber(input.params.noiseAmount, 0.3), 0, 8),
      symmetry: Math.max(1, Math.round(clamp(finiteNumber(input.params.symmetry, 6), 1, 32))),
      vectorSimplification: clamp(finiteNumber(input.params.vectorSimplification, 0.35), 0, 1),
      pathSmoothing: clamp(finiteNumber(input.params.pathSmoothing, 0.72), 0, 1),
      bassInfluence: clamp(finiteNumber(input.params.bassInfluence, 1), 0, 4),
      midInfluence: clamp(finiteNumber(input.params.midInfluence, 0.75), 0, 4),
      highInfluence: clamp(finiteNumber(input.params.highInfluence, 0.5), 0, 4),
      order: clamp(finiteNumber(input.params.order, 0), 0, 1)
    },
    audio: {
      volume: clamp(finiteNumber(input.audio.volume, 0), 0, 1),
      bass: clamp(finiteNumber(input.audio.bass, 0), 0, 1),
      mids: clamp(finiteNumber(input.audio.mids, 0), 0, 1),
      highs: clamp(finiteNumber(input.audio.highs, 0), 0, 1),
      waveform: input.audio.waveform.map((value) => clamp(finiteNumber(value, 0), -1, 1)),
      frequency: input.audio.frequency.map((value) => clamp(finiteNumber(value, 0), 0, 1))
    }
  };
}

function sanitizeGeometry(input: Omit<PatternGeometry, "meta">): Omit<PatternGeometry, "meta"> & { sanitizedCount: number } {
  let sanitizedCount = 0;
  const sanitizeValue = (value: number | undefined, fallback: number): number | undefined => {
    if (value === undefined) return undefined;
    if (Number.isFinite(value)) return value;
    sanitizedCount++;
    return fallback;
  };

  const sanitizePoint = (point: GeometryPoint): GeometryPoint => ({
    x: sanitizeValue(point.x, 0) ?? 0,
    y: sanitizeValue(point.y, 0) ?? 0,
    z: sanitizeValue(point.z, 0),
    size: sanitizeValue(point.size, 1),
    value: sanitizeValue(point.value, 0)
  });

  const points = input.points.map(sanitizePoint);
  const paths = input.paths.map((path) => ({
    ...path,
    points: path.points.map(sanitizePoint)
  }));

  return { points, paths, sanitizedCount };
}

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function seedKey(params: StudioParams, namespace: PatternMode, seed = "sonicfield-default"): string {
  return `${seed}:${namespace}:${params.phase}:${params.frequency}:${params.symmetry}`;
}

function deg(value: number): number {
  return (value / 180) * Math.PI;
}

function pseudoNoise(x: number, y: number, z: number): number {
  return fract(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) * 2 - 1;
}

function fract(value: number): number {
  return value - Math.floor(value);
}
