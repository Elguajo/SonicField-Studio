import { describe, expect, it } from "vitest";
import { exportGeometryToSvg } from "@/lib/renderers/vectorExporter";
import type { PatternGeometry } from "@/types";

describe("exportGeometryToSvg", () => {
  it("exports native SVG groups from geometry without embedding raster data", () => {
    const svg = exportGeometryToSvg(createGeometry(12), {
      width: 320,
      height: 240,
      backgroundColor: "#05070d",
      pointRadius: 1.5,
      strokeWidth: 1,
      maxNodes: 20,
      simplification: 0.2,
      includeBackground: true,
      includePoints: true,
      includePaths: true,
      presetName: "Unit Test",
      foregroundColor: "#ff4d5a"
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain('color="#ff4d5a"');
    expect(svg).toContain("<title>SonicField Studio Export</title>");
    expect(svg).toContain("<desc>");
    expect(svg).toContain('<g id="paths">');
    expect(svg).toContain('<g id="points">');
    expect(svg).toContain("<circle");
    expect(svg).toContain("<path");
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("base64");
  });

  it("samples dense point geometry when maxNodes is low", () => {
    const svg = exportGeometryToSvg(createGeometry(200), {
      width: 320,
      height: 240,
      backgroundColor: "#05070d",
      pointRadius: 1.5,
      strokeWidth: 1,
      maxNodes: 24,
      simplification: 0.6,
      includeBackground: false,
      includePoints: true,
      includePaths: true,
      presetName: "Dense"
    });

    const circleCount = [...svg.matchAll(/<circle /g)].length;

    expect(circleCount).toBeLessThan(200);
    expect(circleCount).toBeGreaterThan(0);
  });

  it("can export particles without path nodes", () => {
    const svg = exportGeometryToSvg(createGeometry(12), {
      width: 320,
      height: 240,
      backgroundColor: "#05070d",
      pointRadius: 1.5,
      strokeWidth: 1,
      maxNodes: 20,
      simplification: 0.2,
      includeBackground: false,
      includePoints: true,
      includePaths: false,
      presetName: "Particles"
    });

    expect(svg).toContain("<circle");
    expect(svg).not.toContain("<path ");
  });

  it("removes overlapping particle circles from SVG export", () => {
    const svg = exportGeometryToSvg(
      {
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 4, y: 0 }
        ],
        paths: [],
        meta: {
          estimatedSvgNodeCount: 3,
          warnings: []
        }
      },
      {
        width: 320,
        height: 240,
        backgroundColor: "#05070d",
        pointRadius: 1,
        strokeWidth: 1,
        maxNodes: 20,
        simplification: 0,
        includeBackground: false,
        includePoints: true,
        includePaths: false,
        presetName: "Particles"
      }
    );

    const circleCount = [...svg.matchAll(/<circle /g)].length;

    expect(circleCount).toBe(2);
  });
});

function createGeometry(count: number): PatternGeometry {
  const points = Array.from({ length: count }, (_, index) => ({
    x: index,
    y: index * 0.5,
    value: index / count
  }));

  return {
    points,
    paths: [
      {
        id: "test-path",
        points,
        closed: false
      }
    ],
    meta: {
      estimatedSvgNodeCount: count + 1,
      warnings: []
    }
  };
}
