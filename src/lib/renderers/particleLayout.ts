import type { GeometryPoint } from "@/types";

export interface ParticleLayoutOptions {
  pointRadius: number;
  padding?: number;
}

export function filterNonOverlappingPoints(
  points: GeometryPoint[],
  options: ParticleLayoutOptions
): GeometryPoint[] {
  const pointRadius = Math.max(0, finiteNumber(options.pointRadius, 0));
  const padding = Math.max(0, finiteNumber(options.padding ?? 0.35, 0.35));
  const minDistance = pointRadius * 2 + padding;

  if (points.length < 2 || minDistance <= 0) {
    return points.filter(isFinitePoint);
  }

  const cellSize = minDistance;
  const minDistanceSquared = minDistance * minDistance;
  const accepted: GeometryPoint[] = [];
  const cells = new Map<string, GeometryPoint[]>();

  for (const point of points) {
    if (!isFinitePoint(point)) continue;

    const cellX = Math.floor(point.x / cellSize);
    const cellY = Math.floor(point.y / cellSize);

    if (hasNeighborWithinDistance(cells, point, cellX, cellY, minDistanceSquared)) {
      continue;
    }

    accepted.push(point);
    const key = cellKey(cellX, cellY);
    const cell = cells.get(key);
    if (cell) {
      cell.push(point);
    } else {
      cells.set(key, [point]);
    }
  }

  return accepted;
}

function hasNeighborWithinDistance(
  cells: Map<string, GeometryPoint[]>,
  point: GeometryPoint,
  cellX: number,
  cellY: number,
  minDistanceSquared: number
): boolean {
  for (let y = cellY - 1; y <= cellY + 1; y++) {
    for (let x = cellX - 1; x <= cellX + 1; x++) {
      const cell = cells.get(cellKey(x, y));
      if (!cell) continue;

      for (const neighbor of cell) {
        const dx = point.x - neighbor.x;
        const dy = point.y - neighbor.y;
        if (dx * dx + dy * dy < minDistanceSquared) {
          return true;
        }
      }
    }
  }

  return false;
}

function cellKey(x: number, y: number): string {
  return `${x}:${y}`;
}

function isFinitePoint(point: GeometryPoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}
