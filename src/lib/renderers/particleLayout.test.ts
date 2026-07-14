import { describe, expect, it } from "vitest";
import { filterNonOverlappingPoints } from "@/lib/renderers/particleLayout";

describe("filterNonOverlappingPoints", () => {
  it("keeps particles at least one diameter apart", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 4.1, y: 0 }
    ];

    expect(filterNonOverlappingPoints(points, { pointRadius: 1, padding: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4.1, y: 0 }
    ]);
  });

  it("filters neighbors across spatial hash cell boundaries", () => {
    const points = [
      { x: 1.9, y: 1.9 },
      { x: 2.1, y: 2.1 },
      { x: 5, y: 5 }
    ];

    expect(filterNonOverlappingPoints(points, { pointRadius: 1, padding: 0 })).toEqual([
      { x: 1.9, y: 1.9 },
      { x: 5, y: 5 }
    ]);
  });

  it("drops invalid particle coordinates before rendering or export", () => {
    const points = [
      { x: 0, y: 0 },
      { x: Number.NaN, y: 0 },
      { x: 10, y: Number.POSITIVE_INFINITY }
    ];

    expect(filterNonOverlappingPoints(points, { pointRadius: 1 })).toEqual([{ x: 0, y: 0 }]);
  });
});
