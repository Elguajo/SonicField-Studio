"use client";

import { create } from "zustand";
import { audioEngine } from "@/lib/audio/audioEngine";
import { downloadActiveCanvasPng } from "@/lib/export/canvasExport";
import { downloadTextFile, slugForFilename, timestampForFilename } from "@/lib/export/download";
import { createPresetSnapshot, parsePresetJson, presets } from "@/lib/presets";
import { exportGeometryToSvg } from "@/lib/renderers/vectorExporter";
import { generatePatternGeometry } from "@/lib/simulation/simulationEngine";
import type {
  AudioSource,
  ExportSettings,
  OutputMode,
  PatternMode,
  StudioNotice,
  StudioParameterKey,
  StudioParams
} from "@/types";

interface StudioStore {
  outputMode: OutputMode;
  patternMode: PatternMode;
  audioSource: AudioSource;
  oscillatorType: OscillatorType;
  params: StudioParams;
  activePresetId: string;
  activePresetName: string;
  exportSettings: ExportSettings;
  notices: StudioNotice[];
  isExportingPng: boolean;
  isExportingSvg: boolean;
  setOutputMode: (mode: OutputMode) => void;
  setPatternMode: (mode: PatternMode) => void;
  setAudioSource: (source: AudioSource) => void;
  setOscillatorType: (type: OscillatorType) => void;
  startOscillator: () => Promise<void>;
  connectAudioFile: (file: File) => Promise<void>;
  connectMicrophone: () => Promise<void>;
  stopAudio: () => void;
  setParam: (key: StudioParameterKey, value: number) => void;
  setExportSetting: <Key extends keyof ExportSettings>(key: Key, value: ExportSettings[Key]) => void;
  applyPreset: (presetId: string) => void;
  exportPreset: () => void;
  importPresetJson: (contents: string) => void;
  pushNotice: (notice: Omit<StudioNotice, "id">) => void;
  dismissNotice: (id: string) => void;
  clearNotices: () => void;
  randomize: () => void;
  reset: () => void;
  exportPng: () => void;
  exportSvg: () => void;
}

export const defaultParams: StudioParams = {
  amplitude: 1.8,
  frequency: 6,
  phase: 0,
  speed: 1,
  density: 0.35,
  particleSize: 2,
  noiseAmount: 0.3,
  symmetry: 6,
  vectorSimplification: 0.35,
  bassInfluence: 1,
  midInfluence: 0.75,
  highInfluence: 0.5
};

export const defaultExportSettings: ExportSettings = {
  rasterWidth: 1200,
  rasterHeight: 900,
  backgroundColor: "#05070d",
  transparentBackground: false,
  svgSimplification: 0.35,
  maxSvgNodes: 15000,
  includeSvgBackground: true
};

export const useStudioStore = create<StudioStore>((set, get) => ({
  outputMode: "raster",
  patternMode: "radial-cymatics",
  audioSource: "none",
  oscillatorType: "sine",
  params: defaultParams,
  activePresetId: "default-cymatics",
  activePresetName: "Default Cymatics",
  exportSettings: defaultExportSettings,
  notices: [],
  isExportingPng: false,
  isExportingSvg: false,

  setOutputMode: (mode) => set({ outputMode: mode }),
  setPatternMode: (mode) => set({ patternMode: mode, activePresetId: "custom", activePresetName: "Custom" }),
  setAudioSource: (source) => set({ audioSource: source }),
  setOscillatorType: (type) => set({ oscillatorType: type }),
  startOscillator: async () => {
    try {
      await audioEngine.startOscillator(get().oscillatorType);
      set((state) => ({
        audioSource: "oscillator",
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-audio-oscillator`,
            level: "success" as const,
            message: "Oscillator audio is driving the pattern."
          }
        ].slice(-4)
      }));
    } catch (error) {
      pushAudioError(set, error, "Audio oscillator could not start.");
    }
  },
  connectAudioFile: async (file) => {
    try {
      await audioEngine.connectFile(file);
      set((state) => ({
        audioSource: "file",
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-audio-file`,
            level: "success" as const,
            message: "Audio file loaded and looping."
          }
        ].slice(-4)
      }));
    } catch (error) {
      pushAudioError(set, error, "Audio file could not be loaded.");
    }
  },
  connectMicrophone: async () => {
    try {
      await audioEngine.connectMicrophone();
      set((state) => ({
        audioSource: "microphone",
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-audio-microphone`,
            level: "success" as const,
            message: "Microphone input is driving the pattern."
          }
        ].slice(-4)
      }));
    } catch (error) {
      pushAudioError(set, error, "Microphone permission was denied or unavailable.");
    }
  },
  stopAudio: () => {
    audioEngine.stopCurrentSource();
    set((state) => ({
      audioSource: "none",
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-audio-stop`,
          level: "info" as const,
          message: "Audio input stopped."
        }
      ].slice(-4)
    }));
  },
  setParam: (key, value) =>
    set((state) => ({
      activePresetId: "custom",
      activePresetName: "Custom",
      params: {
        ...state.params,
        [key]: value
      }
    })),
  setExportSetting: (key, value) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        [key]: value
      }
    })),

  applyPreset: (presetId) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) {
      set((state) => ({
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-preset-error`,
            level: "error" as const,
            message: "Preset was not found."
          }
        ].slice(-4)
      }));
      return;
    }

    set({
      activePresetId: preset.id,
      activePresetName: preset.name,
      patternMode: preset.patternMode,
      params: preset.params
    });
  },

  exportPreset: () => {
    const state = get();
    const snapshot = createPresetSnapshot({
      name: state.activePresetName,
      patternMode: state.patternMode,
      params: state.params,
      exportSettings: state.exportSettings,
      seed: state.activePresetName
    });

    downloadTextFile(
      `sonicfield-${slugForFilename(snapshot.name)}-${timestampForFilename()}.json`,
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "application/json;charset=utf-8"
    );

    set((current) => ({
      notices: [
        ...current.notices,
        {
          id: `${Date.now()}-preset-export`,
          level: "success" as const,
          message: "Preset JSON downloaded."
        }
      ].slice(-4)
    }));
  },

  importPresetJson: (contents) => {
    try {
      const snapshot = parsePresetJson(contents);
      set((state) => ({
        activePresetId: "imported",
        activePresetName: snapshot.name,
        patternMode: snapshot.patternMode,
        params: snapshot.params,
        exportSettings: snapshot.exportSettings,
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-preset-import`,
            level: "success" as const,
            message: "Preset JSON imported."
          }
        ].slice(-4)
      }));
    } catch (error) {
      set((state) => ({
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-preset-import-error`,
            level: "error" as const,
            message: error instanceof Error ? error.message : "Invalid preset file."
          }
        ].slice(-4)
      }));
    }
  },

  pushNotice: (notice) =>
    set((state) => ({
      notices: [
        ...state.notices.filter((item) => item.message !== notice.message),
        {
          ...notice,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`
        }
      ].slice(-4)
    })),
  dismissNotice: (id) =>
    set((state) => ({
      notices: state.notices.filter((notice) => notice.id !== id)
    })),
  clearNotices: () => set({ notices: [] }),

  randomize: () =>
    set(() => ({
      activePresetId: "randomized",
      activePresetName: "Randomized",
      params: {
        amplitude: random(0.5, 4),
        frequency: random(1, 18),
        phase: random(0, 360),
        speed: random(0.1, 3),
        density: random(0.1, 0.8),
        particleSize: random(0.75, 6),
        noiseAmount: random(0, 2),
        symmetry: Math.round(random(2, 12)),
        vectorSimplification: random(0.1, 0.7),
        bassInfluence: random(0, 3),
        midInfluence: random(0, 2),
        highInfluence: random(0, 2)
      }
    })),

  reset: () =>
    set({
      activePresetId: "default-cymatics",
      activePresetName: "Default Cymatics",
      params: defaultParams,
      exportSettings: defaultExportSettings,
      notices: []
    }),

  exportPng: async () => {
    set({ isExportingPng: true });
    try {
      const state = get();
      await downloadActiveCanvasPng(state.activePresetName, state.exportSettings.transparentBackground);
      set((state) => ({
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-png`,
            level: "success" as const,
            message: "PNG export downloaded from the active canvas."
          }
        ].slice(-4)
      }));
    } catch (error) {
      set((state) => ({
        notices: [
          ...state.notices,
          {
            id: `${Date.now()}-png-error`,
            level: "error" as const,
            message: error instanceof Error ? error.message : "PNG export failed."
          }
        ].slice(-4)
      }));
    } finally {
      set({ isExportingPng: false });
    }
  },

  exportSvg: () => {
    set({ isExportingSvg: true });
    try {
      const state = get();
      const { exportSettings } = state;
      const geometry = generatePatternGeometry({
        params: state.params,
        patternMode: state.patternMode,
        width: exportSettings.rasterWidth,
        height: exportSettings.rasterHeight,
        time: 0,
        audio: {
          volume: 0,
          bass: 0,
          mids: 0,
          highs: 0,
          waveform: [],
          frequency: []
        },
        seed: state.activePresetName
      });

      const svg = exportGeometryToSvg(geometry, {
        width: exportSettings.rasterWidth,
        height: exportSettings.rasterHeight,
        backgroundColor: exportSettings.backgroundColor,
        pointRadius: Math.max(0.5, state.params.particleSize * 0.35),
        strokeWidth: 1,
        maxNodes: exportSettings.maxSvgNodes,
        simplification: exportSettings.svgSimplification,
        includeBackground: exportSettings.includeSvgBackground,
        presetName: state.activePresetName
      });

      downloadTextFile(
        `sonicfield-${slugForFilename(state.activePresetName || state.patternMode)}-${timestampForFilename()}.svg`,
        svg,
        "image/svg+xml;charset=utf-8"
      );

      set((current) => ({
        notices: [
          ...current.notices,
          {
            id: `${Date.now()}-svg`,
            level: geometry.meta.estimatedSvgNodeCount > exportSettings.maxSvgNodes ? ("warning" as const) : ("success" as const),
            message:
              geometry.meta.estimatedSvgNodeCount > exportSettings.maxSvgNodes
                ? "SVG exported with sampling because the geometry exceeded the node limit."
                : "SVG export downloaded."
          }
        ].slice(-4)
      }));
    } catch (error) {
      set((current) => ({
        notices: [
          ...current.notices,
          {
            id: `${Date.now()}-svg-error`,
            level: "error" as const,
            message: error instanceof Error ? error.message : "SVG export failed."
          }
        ].slice(-4)
      }));
    } finally {
      set({ isExportingSvg: false });
    }
  }
}));

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pushAudioError(
  set: (partial: Partial<StudioStore> | ((state: StudioStore) => Partial<StudioStore>)) => void,
  error: unknown,
  fallback: string
): void {
  set((state) => ({
    audioSource: "none",
    notices: [
      ...state.notices,
      {
        id: `${Date.now()}-audio-error`,
        level: "error" as const,
        message: error instanceof Error ? error.message : fallback
      }
    ].slice(-4)
  }));
}
