"use client";

import { useStudioStore } from "@/store/useStudioStore";

export function TopBar() {
  const mode = useStudioStore((state) => state.outputMode);
  const setOutputMode = useStudioStore((state) => state.setOutputMode);
  const randomize = useStudioStore((state) => state.randomize);
  const reset = useStudioStore((state) => state.reset);

  return (
    <header className="flex min-h-14 flex-col gap-3 border-b border-studio-line bg-studio-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div>
        <h1 className="text-sm font-semibold tracking-wide">SonicField Studio</h1>
        <p className="text-xs text-studio-muted">Audio-driven raster + vector pattern generator</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="output-mode" className="sr-only">
          Output mode
        </label>
        <select
          id="output-mode"
          className="rounded-md border border-studio-line bg-studio-bg px-3 py-1 text-sm"
          value={mode}
          onChange={(event) => setOutputMode(event.target.value as "raster" | "vector")}
        >
          <option value="raster">Raster Preview</option>
          <option value="vector">Vector Preview</option>
        </select>

        <button type="button" className="rounded-md border border-studio-line px-3 py-1 text-sm" onClick={randomize}>
          Randomize
        </button>

        <button type="button" className="rounded-md border border-studio-line px-3 py-1 text-sm" onClick={reset}>
          Reset
        </button>
      </div>
    </header>
  );
}
