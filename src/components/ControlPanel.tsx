"use client";

import { useRef } from "react";
import { presets } from "@/lib/presets";
import { useStudioStore } from "@/store/useStudioStore";
import type { StudioParameterKey } from "@/types";

const controls: Array<{
  key: StudioParameterKey;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: "amplitude", label: "Amplitude", min: 0, max: 5, step: 0.01 },
  { key: "frequency", label: "Frequency", min: 0.1, max: 20, step: 0.1 },
  { key: "phase", label: "Phase", min: 0, max: 360, step: 1 },
  { key: "speed", label: "Speed", min: 0, max: 5, step: 0.01 },
  { key: "density", label: "Density", min: 0.05, max: 1, step: 0.01 },
  { key: "particleSize", label: "Particle Size", min: 0.5, max: 12, step: 0.1 },
  { key: "noiseAmount", label: "Noise", min: 0, max: 5, step: 0.01 },
  { key: "symmetry", label: "Symmetry", min: 1, max: 16, step: 1 },
  { key: "vectorSimplification", label: "Vector Simplification", min: 0, max: 1, step: 0.01 }
];

export function ControlPanel() {
  const presetInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const params = useStudioStore((state) => state.params);
  const setParam = useStudioStore((state) => state.setParam);
  const drawMode = useStudioStore((state) => state.drawMode);
  const setDrawMode = useStudioStore((state) => state.setDrawMode);
  const isAnimationEnabled = useStudioStore((state) => state.isAnimationEnabled);
  const setAnimationEnabled = useStudioStore((state) => state.setAnimationEnabled);
  const activePresetId = useStudioStore((state) => state.activePresetId);
  const patternMode = useStudioStore((state) => state.patternMode);
  const setPatternMode = useStudioStore((state) => state.setPatternMode);
  const applyPreset = useStudioStore((state) => state.applyPreset);
  const exportPreset = useStudioStore((state) => state.exportPreset);
  const importPresetJson = useStudioStore((state) => state.importPresetJson);
  const notices = useStudioStore((state) => state.notices);
  const dismissNotice = useStudioStore((state) => state.dismissNotice);
  const exportSettings = useStudioStore((state) => state.exportSettings);
  const setExportSetting = useStudioStore((state) => state.setExportSetting);
  const audioSource = useStudioStore((state) => state.audioSource);
  const oscillatorType = useStudioStore((state) => state.oscillatorType);
  const setOscillatorType = useStudioStore((state) => state.setOscillatorType);
  const startOscillator = useStudioStore((state) => state.startOscillator);
  const connectAudioFile = useStudioStore((state) => state.connectAudioFile);
  const connectMicrophone = useStudioStore((state) => state.connectMicrophone);
  const stopAudio = useStudioStore((state) => state.stopAudio);
  const isExportingPng = useStudioStore((state) => state.isExportingPng);
  const isExportingSvg = useStudioStore((state) => state.isExportingSvg);
  const exportPng = useStudioStore((state) => state.exportPng);
  const exportSvg = useStudioStore((state) => state.exportSvg);

  return (
    <aside className="max-h-none overflow-y-auto border-t border-studio-line bg-studio-panel p-4 lg:max-h-full lg:border-l lg:border-t-0">
      {notices.length > 0 ? (
        <section className="mb-5 space-y-2" aria-label="Studio notices" aria-live="polite">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between gap-3 rounded-md border border-studio-line bg-studio-bg px-3 py-2 text-xs"
              role={notice.level === "error" ? "alert" : "status"}
            >
              <p className={notice.level === "error" ? "text-red-200" : "text-studio-muted"}>
                {notice.message}
              </p>
              <button
                type="button"
                className="text-studio-muted hover:text-studio-text"
                onClick={() => dismissNotice(notice.id)}
                aria-label="Dismiss notice"
              >
                Dismiss
              </button>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-studio-muted">
          Pattern
        </h2>

        <label htmlFor="preset-selector" className="mb-1 block text-xs text-studio-muted">
          Preset
        </label>
        <select
          id="preset-selector"
          className="mb-3 w-full rounded-md border border-studio-line bg-studio-bg px-3 py-2 text-sm"
          value={presets.some((preset) => preset.id === activePresetId) ? activePresetId : "current"}
          onChange={(event) => {
            if (event.target.value !== "current") {
              applyPreset(event.target.value);
            }
          }}
        >
          <option value="current">Current Settings</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>

        <label htmlFor="pattern-mode" className="sr-only">
          Pattern mode
        </label>
        <select
          id="pattern-mode"
          className="w-full rounded-md border border-studio-line bg-studio-bg px-3 py-2 text-sm"
          value={patternMode}
          onChange={(event) => setPatternMode(event.target.value as never)}
        >
          <option value="wave-grid">Wave Grid</option>
          <option value="radial-cymatics">Radial Cymatics</option>
          <option value="lissajous">Lissajous</option>
          <option value="sphere-field">Sphere Field</option>
          <option value="noise-flow">Noise Flow</option>
        </select>

        <label htmlFor="draw-mode" className="mb-1 mt-3 block text-xs text-studio-muted">
          Draw Mode
        </label>
        <select
          id="draw-mode"
          className="w-full rounded-md border border-studio-line bg-studio-bg px-3 py-2 text-sm"
          value={drawMode}
          onChange={(event) => setDrawMode(event.target.value as typeof drawMode)}
        >
          <option value="both">Lines + Particles</option>
          <option value="lines">Lines Only</option>
          <option value="particles">Particles Only</option>
        </select>

        <label className="mt-3 flex items-center gap-2 text-xs text-studio-muted">
          <input
            type="checkbox"
            checked={isAnimationEnabled}
            onChange={(event) => setAnimationEnabled(event.target.checked)}
          />
          Animate preview
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-studio-muted">
          Parameters
        </h2>

        {controls.map((control) => (
          <label key={control.key} className="block">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span id={`${control.key}-label`}>{control.label}</span>
              <span className="text-studio-muted">{params[control.key].toFixed(2)}</span>
            </div>
            <input
              aria-labelledby={`${control.key}-label`}
              className="w-full"
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={params[control.key]}
              onChange={(event) => setParam(control.key, Number(event.target.value))}
            />
          </label>
        ))}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-studio-muted">
            Audio
          </h2>
          <span className="text-xs text-studio-muted">{audioSource}</span>
        </div>

        <label htmlFor="oscillator-type" className="mb-1 block text-xs text-studio-muted">
          Oscillator
        </label>
        <select
          id="oscillator-type"
          className="mb-3 w-full rounded-md border border-studio-line bg-studio-bg px-3 py-2 text-sm"
          value={oscillatorType}
          onChange={(event) => setOscillatorType(event.target.value as OscillatorType)}
        >
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="rounded-md border border-studio-line px-3 py-2 text-sm" onClick={startOscillator}>
            Start Osc
          </button>
          <button
            type="button"
            className="rounded-md border border-studio-line px-3 py-2 text-sm"
            onClick={() => audioInputRef.current?.click()}
          >
            Load Audio
          </button>
          <button type="button" className="rounded-md border border-studio-line px-3 py-2 text-sm" onClick={connectMicrophone}>
            Microphone
          </button>
          <button type="button" className="rounded-md border border-studio-line px-3 py-2 text-sm" onClick={stopAudio}>
            Stop Audio
          </button>
          <input
            ref={audioInputRef}
            className="hidden"
            type="file"
            accept="audio/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              await connectAudioFile(file);
            }}
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-md bg-studio-accent px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          onClick={exportPng}
          disabled={isExportingPng}
        >
          {isExportingPng ? "Exporting..." : "Export PNG"}
        </button>
        <button
          type="button"
          className="rounded-md border border-studio-line px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          onClick={exportSvg}
          disabled={isExportingSvg}
        >
          {isExportingSvg ? "Exporting..." : "Export SVG"}
        </button>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-studio-muted">
          Export Settings
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-studio-muted">
            PNG Width
            <input
              className="mt-1 w-full rounded-md border border-studio-line bg-studio-bg px-2 py-1 text-sm text-studio-text"
              type="number"
              min={1}
              max={10000}
              value={exportSettings.rasterWidth}
              onChange={(event) => setExportSetting("rasterWidth", Number(event.target.value))}
            />
          </label>
          <label className="block text-xs text-studio-muted">
            PNG Height
            <input
              className="mt-1 w-full rounded-md border border-studio-line bg-studio-bg px-2 py-1 text-sm text-studio-text"
              type="number"
              min={1}
              max={10000}
              value={exportSettings.rasterHeight}
              onChange={(event) => setExportSetting("rasterHeight", Number(event.target.value))}
            />
          </label>
        </div>

        <label className="block text-xs text-studio-muted">
          SVG Node Limit
          <input
            className="mt-1 w-full rounded-md border border-studio-line bg-studio-bg px-2 py-1 text-sm text-studio-text"
            type="number"
            min={1}
            max={100000}
            step={100}
            value={exportSettings.maxSvgNodes}
            onChange={(event) => setExportSetting("maxSvgNodes", Number(event.target.value))}
          />
        </label>

        <label className="block text-xs text-studio-muted">
          SVG Simplification
          <input
            className="mt-1 w-full"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={exportSettings.svgSimplification}
            onChange={(event) => setExportSetting("svgSimplification", Number(event.target.value))}
          />
        </label>
      </section>

      <label className="mt-3 flex items-center gap-2 text-xs text-studio-muted">
        <input
          type="checkbox"
          checked={exportSettings.transparentBackground}
          onChange={(event) => setExportSetting("transparentBackground", event.target.checked)}
        />
        Transparent PNG background
      </label>
      <label className="mt-2 flex items-center gap-2 text-xs text-studio-muted">
        <input
          type="checkbox"
          checked={exportSettings.includeSvgBackground}
          onChange={(event) => setExportSetting("includeSvgBackground", event.target.checked)}
        />
        Include SVG background
      </label>

      <section className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="rounded-md border border-studio-line px-3 py-2 text-sm" onClick={exportPreset}>
          Export Preset
        </button>
        <button
          type="button"
          className="rounded-md border border-studio-line px-3 py-2 text-sm"
          onClick={() => presetInputRef.current?.click()}
        >
          Import Preset
        </button>
        <input
          ref={presetInputRef}
          className="hidden"
          type="file"
          accept="application/json,.json"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            importPresetJson(await file.text());
          }}
        />
      </section>

      <p className="mt-4 text-xs leading-relaxed text-studio-muted">
        Vector export must be generated from geometry, not from raster tracing. Dense particle scenes should be simplified before SVG export.
      </p>
    </aside>
  );
}
