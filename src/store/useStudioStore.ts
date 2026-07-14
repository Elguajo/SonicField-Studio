"use client";

import { create } from "zustand";
import { audioEngine } from "@/lib/audio/audioEngine";
import { downloadActiveCanvasPng } from "@/lib/export/canvasExport";
import { downloadTextFile, slugForFilename, timestampForFilename } from "@/lib/export/download";
import { createPresetSnapshot, parsePresetJson, presets } from "@/lib/presets";
import { exportGeometryToSvg } from "@/lib/renderers/vectorExporter";
import { generatePatternGeometry } from "@/lib/simulation/simulationEngine";
import {
  applyExportProfile,
  applyPaletteToExportSettings,
  colorPalettes,
  createGalleryItem,
  createSeed,
  exportProfiles,
  generateDesignVariations
} from "@/lib/workflow/designerWorkflow";
import type {
  AudioAnalysisFrame,
  AudioSource,
  DesignVariation,
  DrawMode,
  ExportSettings,
  GalleryItem,
  PatternMode,
  StudioNotice,
  StudioParameterKey,
  StudioParams
} from "@/types";

interface StudioStore {
  patternMode: PatternMode;
  drawMode: DrawMode;
  isAnimationEnabled: boolean;
  audioSource: AudioSource;
  oscillatorType: OscillatorType;
  params: StudioParams;
  activePresetId: string;
  activePresetName: string;
  exportSettings: ExportSettings;
  paletteId: string;
  exportProfileId: string;
  activeSeed: string;
  isSeedLocked: boolean;
  pointColor: string;
  frozenAudioFrame: AudioAnalysisFrame | null;
  variations: DesignVariation[];
  gallery: GalleryItem[];
  notices: StudioNotice[];
  isExportingPng: boolean;
  isExportingSvg: boolean;
  setPatternMode: (mode: PatternMode) => void;
  setDrawMode: (mode: DrawMode) => void;
  setAnimationEnabled: (enabled: boolean) => void;
  setAudioSource: (source: AudioSource) => void;
  setOscillatorType: (type: OscillatorType) => void;
  startOscillator: () => Promise<void>;
  connectAudioFile: (file: File) => Promise<void>;
  connectMicrophone: () => Promise<void>;
  stopAudio: () => void;
  setParam: (key: StudioParameterKey, value: number) => void;
  setExportSetting: <Key extends keyof ExportSettings>(key: Key, value: ExportSettings[Key]) => void;
  applyPalette: (paletteId: string) => void;
  applyExportProfile: (profileId: string) => void;
  applyPreset: (presetId: string) => void;
  exportPreset: () => void;
  importPresetJson: (contents: string) => void;
  lockSeed: () => void;
  unlockSeed: () => void;
  generateVariations: () => void;
  applyVariation: (variationId: string) => void;
  saveToGallery: () => void;
  restoreGalleryItem: (itemId: string) => void;
  freezeCurrentAudioFrame: () => void;
  clearFrozenAudioFrame: () => void;
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
  pathSmoothing: 0.72,
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
  includeSvgBackground: true,
  drawMode: "both"
};

export const useStudioStore = create<StudioStore>((set, get) => ({
  patternMode: "radial-cymatics",
  drawMode: "both",
  isAnimationEnabled: false,
  audioSource: "none",
  oscillatorType: "sine",
  params: defaultParams,
  activePresetId: "default-cymatics",
  activePresetName: "Default Cymatics",
  exportSettings: defaultExportSettings,
  paletteId: colorPalettes[0].id,
  exportProfileId: "custom",
  activeSeed: "default-cymatics",
  isSeedLocked: false,
  pointColor: colorPalettes[0].primaryColor,
  frozenAudioFrame: null,
  variations: [],
  gallery: [],
  notices: [],
  isExportingPng: false,
  isExportingSvg: false,

  setPatternMode: (mode) => set({ patternMode: mode, activePresetId: "custom", activePresetName: "Custom" }),
  setDrawMode: (mode) =>
    set((state) => ({
      drawMode: mode,
      exportSettings: {
        ...state.exportSettings,
        drawMode: mode
      }
    })),
  setAnimationEnabled: (enabled) => set({ isAnimationEnabled: enabled }),
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
      },
      exportProfileId: "custom"
    })),

  applyPalette: (paletteId) => {
    const palette = colorPalettes.find((item) => item.id === paletteId);
    if (!palette) return;

    set((state) => ({
      paletteId: palette.id,
      pointColor: palette.primaryColor,
      exportSettings: applyPaletteToExportSettings(state.exportSettings, palette),
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-palette`,
          level: "info" as const,
          message: `${palette.name} palette applied.`
        }
      ].slice(-4)
    }));
  },

  applyExportProfile: (profileId) => {
    if (profileId === "custom") {
      set({ exportProfileId: "custom" });
      return;
    }

    const profile = exportProfiles.find((item) => item.id === profileId);
    if (!profile) return;

    set((state) => ({
      exportProfileId: profile.id,
      exportSettings: applyExportProfile(
        state.exportSettings,
        profile,
        state.drawMode,
        state.exportSettings.backgroundColor
      ),
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-export-profile`,
          level: "info" as const,
          message: `${profile.name} export profile applied.`
        }
      ].slice(-4)
    }));
  },

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

    set((state) => ({
      activePresetId: preset.id,
      activePresetName: preset.name,
      patternMode: preset.patternMode,
      drawMode: "both",
      params: preset.params,
      exportSettings: {
        ...state.exportSettings,
        drawMode: "both"
      },
      activeSeed: preset.id,
      variations: []
    }));
  },

  exportPreset: () => {
    const state = get();
    const snapshot = createPresetSnapshot({
      name: state.activePresetName,
      patternMode: state.patternMode,
      params: state.params,
      exportSettings: state.exportSettings,
      drawMode: state.drawMode,
      animatePreview: state.isAnimationEnabled,
      paletteId: state.paletteId,
      exportProfileId: state.exportProfileId,
      seed: state.activeSeed
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
      const palette = snapshot.paletteId ? colorPalettes.find((item) => item.id === snapshot.paletteId) : undefined;
      const drawMode = snapshot.drawMode ?? snapshot.exportSettings.drawMode;
      set((state) => ({
        activePresetId: "imported",
        activePresetName: snapshot.name,
        patternMode: snapshot.patternMode,
        drawMode,
        isAnimationEnabled: snapshot.animatePreview ?? false,
        params: snapshot.params,
        exportSettings: {
          ...snapshot.exportSettings,
          drawMode
        },
        paletteId: palette?.id ?? state.paletteId,
        pointColor: palette?.primaryColor ?? state.pointColor,
        exportProfileId: snapshot.exportProfileId ?? "custom",
        activeSeed: snapshot.seed ?? createSeed(snapshot.name),
        variations: [],
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

  lockSeed: () =>
    set((state) => ({
      isSeedLocked: true,
      activeSeed: state.activeSeed || createSeed(state.activePresetName)
    })),

  unlockSeed: () =>
    set((state) => ({
      isSeedLocked: false,
      activeSeed: createSeed(state.activePresetName)
    })),

  generateVariations: () =>
    set((state) => ({
      variations: generateDesignVariations({
        params: state.params,
        patternMode: state.patternMode,
        seed: state.activeSeed || createSeed(state.activePresetName)
      }),
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-variations`,
          level: "success" as const,
          message: "Variations generated."
        }
      ].slice(-4)
    })),

  applyVariation: (variationId) => {
    const variation = get().variations.find((item) => item.id === variationId);
    if (!variation) return;

    set((state) => ({
      activePresetId: "variation",
      activePresetName: variation.name,
      patternMode: variation.patternMode,
      params: variation.params,
      activeSeed: variation.seed,
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-variation-apply`,
          level: "info" as const,
          message: `${variation.name} applied.`
        }
      ].slice(-4)
    }));
  },

  saveToGallery: () => {
    const state = get();
    const item = createGalleryItem({
      name: state.activePresetName,
      patternMode: state.patternMode,
      drawMode: state.drawMode,
      params: state.params,
      exportSettings: state.exportSettings,
      paletteId: state.paletteId,
      exportProfileId: state.exportProfileId,
      seed: state.activeSeed
    });

    set((current) => ({
      gallery: [item, ...current.gallery].slice(0, 24),
      notices: [
        ...current.notices,
        {
          id: `${Date.now()}-gallery-save`,
          level: "success" as const,
          message: "Pattern saved to gallery."
        }
      ].slice(-4)
    }));
  },

  restoreGalleryItem: (itemId) => {
    const item = get().gallery.find((entry) => entry.id === itemId);
    if (!item) return;

    const palette = colorPalettes.find((entry) => entry.id === item.paletteId);
    set((state) => ({
      activePresetId: "gallery",
      activePresetName: item.name,
      patternMode: item.patternMode,
      drawMode: item.drawMode,
      params: item.params,
      exportSettings: item.exportSettings,
      paletteId: item.paletteId,
      exportProfileId: item.exportProfileId,
      pointColor: palette?.primaryColor ?? state.pointColor,
      activeSeed: item.seed,
      variations: [],
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-gallery-restore`,
          level: "info" as const,
          message: "Gallery pattern restored."
        }
      ].slice(-4)
    }));
  },

  freezeCurrentAudioFrame: () =>
    set((state) => ({
      frozenAudioFrame: audioEngine.getFrame(),
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-audio-freeze`,
          level: "info" as const,
          message: "Audio frame frozen for deterministic export."
        }
      ].slice(-4)
    })),

  clearFrozenAudioFrame: () =>
    set((state) => ({
      frozenAudioFrame: null,
      notices: [
        ...state.notices,
        {
          id: `${Date.now()}-audio-live`,
          level: "info" as const,
          message: "Live audio frame restored."
        }
      ].slice(-4)
    })),

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

  randomize: () => {
    const state = get();
    const seed = state.isSeedLocked ? state.activeSeed : createSeed("randomized");
    const [variation] = generateDesignVariations({
      params: state.params,
      patternMode: state.patternMode,
      seed,
      count: 1
    });

    set(() => ({
      activePresetId: "randomized",
      activePresetName: "Randomized",
      patternMode: variation?.patternMode ?? state.patternMode,
      params: variation?.params ?? state.params,
      activeSeed: state.isSeedLocked ? seed : variation?.seed ?? seed
    }));
  },

  reset: () =>
    set({
      activePresetId: "default-cymatics",
      activePresetName: "Default Cymatics",
      drawMode: "both",
      isAnimationEnabled: false,
      params: defaultParams,
      exportSettings: defaultExportSettings,
      paletteId: colorPalettes[0].id,
      exportProfileId: "custom",
      activeSeed: "default-cymatics",
      isSeedLocked: false,
      pointColor: colorPalettes[0].primaryColor,
      frozenAudioFrame: null,
      variations: [],
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
        audio: state.frozenAudioFrame ?? {
          volume: 0,
          bass: 0,
          mids: 0,
          highs: 0,
          waveform: [],
          frequency: []
        },
        seed: state.activeSeed
      });

      const svg = exportGeometryToSvg(geometry, {
        width: exportSettings.rasterWidth,
        height: exportSettings.rasterHeight,
        backgroundColor: exportSettings.backgroundColor,
        pointRadius: Math.max(0.5, state.params.particleSize * 0.35),
        strokeWidth: 1,
        maxNodes: exportSettings.maxSvgNodes,
        simplification: exportSettings.svgSimplification,
        pathSmoothing: state.params.pathSmoothing,
        includeBackground: exportSettings.includeSvgBackground,
        includePoints: state.drawMode === "particles" || state.drawMode === "both",
        includePaths: state.drawMode === "lines" || state.drawMode === "both",
        presetName: state.activePresetName,
        foregroundColor: state.pointColor
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
