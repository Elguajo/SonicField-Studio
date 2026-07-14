import type { GeometryPoint } from "@/types";

export function drawSmoothedPath(
  context: CanvasRenderingContext2D,
  points: GeometryPoint[],
  closed: boolean | undefined,
  smoothing: number
): void {
  if (points.length < 2) return;

  const amount = clamp(smoothing, 0, 1);
  context.moveTo(points[0].x, points[0].y);

  if (amount <= 0 || points.length < 3) {
    for (let index = 1; index < points.length; index++) {
      context.lineTo(points[index].x, points[index].y);
    }
    if (closed) context.closePath();
    return;
  }

  const segmentCount = closed ? points.length : points.length - 1;
  for (let index = 0; index < segmentCount; index++) {
    const previous = pointAt(points, index - 1, closed);
    const current = pointAt(points, index, closed);
    const next = pointAt(points, index + 1, closed);
    const after = pointAt(points, index + 2, closed);
    const controlScale = amount / 6;

    context.bezierCurveTo(
      current.x + (next.x - previous.x) * controlScale,
      current.y + (next.y - previous.y) * controlScale,
      next.x - (after.x - current.x) * controlScale,
      next.y - (after.y - current.y) * controlScale,
      next.x,
      next.y
    );
  }

  if (closed) context.closePath();
}

export function buildSmoothedSvgPath(points: GeometryPoint[], closed: boolean | undefined, smoothing: number): string {
  if (points.length < 2) return "";

  const amount = clamp(smoothing, 0, 1);
  const commands = [`M ${round(points[0].x)} ${round(points[0].y)}`];

  if (amount <= 0 || points.length < 3) {
    for (let index = 1; index < points.length; index++) {
      commands.push(`L ${round(points[index].x)} ${round(points[index].y)}`);
    }
    if (closed) commands.push("Z");
    return commands.join(" ");
  }

  const segmentCount = closed ? points.length : points.length - 1;
  for (let index = 0; index < segmentCount; index++) {
    const previous = pointAt(points, index - 1, closed);
    const current = pointAt(points, index, closed);
    const next = pointAt(points, index + 1, closed);
    const after = pointAt(points, index + 2, closed);
    const controlScale = amount / 6;

    commands.push(
      [
        "C",
        round(current.x + (next.x - previous.x) * controlScale),
        round(current.y + (next.y - previous.y) * controlScale),
        round(next.x - (after.x - current.x) * controlScale),
        round(next.y - (after.y - current.y) * controlScale),
        round(next.x),
        round(next.y)
      ].join(" ")
    );
  }

  if (closed) commands.push("Z");
  return commands.join(" ");
}

function pointAt(points: GeometryPoint[], index: number, closed: boolean | undefined): GeometryPoint {
  if (closed) {
    return points[(index + points.length) % points.length];
  }

  return points[Math.min(points.length - 1, Math.max(0, index))];
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
