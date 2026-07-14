"use client";

import { useStudioStore } from "@/store/useStudioStore";

export function TopBar() {
  const randomize = useStudioStore((state) => state.randomize);
  const reset = useStudioStore((state) => state.reset);

  return (
    <header className="flex min-h-14 flex-col gap-3 border-b border-studio-line bg-studio-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div>
        <h1 className="text-sm font-semibold tracking-wide">SonicField Studio</h1>
        <p className="text-xs text-studio-muted">Audio-driven pattern generator with raster + vector export</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
