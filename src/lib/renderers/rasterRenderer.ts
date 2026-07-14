import type { PatternGeometry } from "@/types";
import { filterNonOverlappingPoints } from "@/lib/renderers/particleLayout";
import { drawSmoothedPath } from "@/lib/renderers/pathSmoothing";

export interface RasterRenderOptions {
  width: number;
  height: number;
  backgroundColor: string;
  pointColor: string;
  pointRadius: number;
  drawPoints: boolean;
  drawPaths: boolean;
  pathSmoothing?: number;
  glow?: boolean;
  trailOpacity?: number;
}

export function renderGeometryToCanvas(
  context: CanvasRenderingContext2D,
  geometry: PatternGeometry,
  options: RasterRenderOptions
): void {
  const backgroundAlpha = clamp(options.trailOpacity ?? 1, 0, 1);
  if (backgroundAlpha >= 1) {
    context.clearRect(0, 0, options.width, options.height);
  }

  context.fillStyle = colorWithAlpha(options.backgroundColor, backgroundAlpha);
  context.fillRect(0, 0, options.width, options.height);

  if (options.drawPaths) {
    context.save();
    if (options.glow) {
      context.shadowColor = "rgba(125, 211, 252, 0.45)";
      context.shadowBlur = 12;
    }
    context.strokeStyle = "rgba(125, 211, 252, 0.25)";
    context.lineWidth = 1;
    for (const path of geometry.paths) {
      if (path.points.length < 2) continue;
      context.beginPath();
      drawSmoothedPath(context, path.points, path.closed, options.pathSmoothing ?? 0);
      context.stroke();
    }
    context.restore();
  }

  if (options.drawPoints) {
    context.save();
    if (options.glow) {
      context.shadowColor = options.pointColor;
      context.shadowBlur = 18;
    }
    context.fillStyle = options.pointColor;
    const points = filterNonOverlappingPoints(geometry.points, {
      pointRadius: options.pointRadius
    });
    for (const point of points) {
      context.beginPath();
      context.arc(point.x, point.y, options.pointRadius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}

function colorWithAlpha(color: string, alpha: number): string {
  if (alpha >= 1) return color;
  const hex = color.replace("#", "");

  if (hex.length !== 6) {
    return color;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
