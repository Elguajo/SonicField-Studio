"use client";

import { useStudioStore } from "@/store/useStudioStore";

export function TopBar() {
  const randomize = useStudioStore((state) => state.randomize);
  const reset = useStudioStore((state) => state.reset);

  return (
    <header className="flex min-h-14 flex-col gap-3 border-b border-studio-line bg-studio-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-studio-accent" aria-hidden />
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-studio-text">SonicField Studio</h1>
          <p className="text-xs text-studio-muted">Audio-driven pattern generator with raster + vector export</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-studio-line bg-studio-panel px-3.5 py-1.5 text-sm font-medium text-studio-text transition-colors hover:border-studio-lineStrong"
          onClick={randomize}
        >
          Randomize
        </button>

        <button
          type="button"
          className="rounded-md px-3.5 py-1.5 text-sm font-medium text-studio-text transition-colors hover:bg-studio-panel"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </header>
  );
}
