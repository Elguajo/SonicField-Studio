"use client";

import { useEffect, useMemo, useRef } from "react";
import { audioEngine } from "@/lib/audio/audioEngine";
import { setActiveCanvas } from "@/lib/export/canvasExport";
import { renderGeometryToCanvas } from "@/lib/renderers/rasterRenderer";
import { generatePatternGeometry } from "@/lib/simulation/simulationEngine";
import { useStudioStore } from "@/store/useStudioStore";

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const latestFrameRef = useRef<{
    geometry: ReturnType<typeof generatePatternGeometry>;
    width: number;
    height: number;
  } | null>(null);
  const params = useStudioStore((state) => state.params);
  const patternMode = useStudioStore((state) => state.patternMode);
  const drawMode = useStudioStore((state) => state.drawMode);
  const isAnimationEnabled = useStudioStore((state) => state.isAnimationEnabled);
  const audioSource = useStudioStore((state) => state.audioSource);
  const activeSeed = useStudioStore((state) => state.activeSeed);
  const backgroundColor = useStudioStore((state) => state.exportSettings.backgroundColor);
  const pointColor = useStudioStore((state) => state.pointColor);
  const frozenAudioFrame = useStudioStore((state) => state.frozenAudioFrame);
  const pushNotice = useStudioStore((state) => state.pushNotice);

  const geometry = useMemo(() => {
    return generatePatternGeometry({
      params,
      patternMode,
      width: 1200,
      height: 900,
      time: 0,
      audio: {
        volume: 0,
        bass: 0,
        mids: 0,
        highs: 0,
        waveform: [],
        frequency: []
      },
      seed: activeSeed
    });
  }, [activeSeed, params, patternMode]);

  useEffect(() => {
    if (!geometry.meta.warning) return;

    pushNotice({
      level: "warning",
      message: geometry.meta.warning
    });
  }, [geometry.meta.warning, pushNotice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const context = canvas.getContext("2d");
    if (!context || !parent) {
      pushNotice({
        level: "error",
        message: "Canvas rendering is unavailable in this browser."
      });
      return;
    }

    let renderStaticFrame: (() => void) | null = null;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!isAnimationEnabled) {
        renderStaticFrame?.();
      }
    };

    resize();
    setActiveCanvas({
      canvas,
      renderTransparentCanvas: () => {
        const latestFrame = latestFrameRef.current;
        const transparentCanvas = document.createElement("canvas");
        transparentCanvas.width = canvas.width;
        transparentCanvas.height = canvas.height;
        const transparentContext = transparentCanvas.getContext("2d");

        if (!transparentContext || !latestFrame) {
          return canvas;
        }

        const dpr = transparentCanvas.width / Math.max(1, latestFrame.width);
        transparentContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderGeometryToCanvas(transparentContext, latestFrame.geometry, {
          width: latestFrame.width,
          height: latestFrame.height,
          backgroundColor,
          pointColor,
          pointRadius: Math.max(0.75, params.particleSize * 0.35),
          drawPoints: drawMode === "particles" || drawMode === "both",
          drawPaths: drawMode === "lines" || drawMode === "both",
          pathSmoothing: params.pathSmoothing,
          glow: false,
          trailOpacity: 0
        });

        return transparentCanvas;
      }
    });

    let animationFrame = 0;
    let start = performance.now();

    const render = () => {
      const rect = parent.getBoundingClientRect();
      const time = isAnimationEnabled ? (performance.now() - start) / 1000 : 0;

      const frameGeometry = generatePatternGeometry({
        params,
        patternMode,
        width: rect.width,
        height: rect.height,
        time,
        audio: frozenAudioFrame ?? (audioSource === "none" ? emptyAudioFrame : audioEngine.getFrame()),
        seed: activeSeed
      });
      latestFrameRef.current = {
        geometry: frameGeometry,
        width: rect.width,
        height: rect.height
      };

      renderGeometryToCanvas(context, frameGeometry, {
        width: rect.width,
        height: rect.height,
        backgroundColor,
        pointColor,
        pointRadius: Math.max(0.75, params.particleSize * 0.35),
        drawPoints: drawMode === "particles" || drawMode === "both",
        drawPaths: drawMode === "lines" || drawMode === "both",
        pathSmoothing: params.pathSmoothing,
        glow: false,
        trailOpacity: 1
      });

      if (isAnimationEnabled) {
        animationFrame = requestAnimationFrame(render);
      }
    };
    renderStaticFrame = render;

    render();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      setActiveCanvas(null);
    };
  }, [activeSeed, backgroundColor, frozenAudioFrame, params, patternMode, drawMode, isAnimationEnabled, audioSource, pointColor, pushNotice]);

  return (
    <section className="relative min-h-[520px] overflow-hidden lg:min-h-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 rounded-md border border-studio-line bg-black/30 px-3 py-2 text-xs text-studio-muted backdrop-blur">
        Preview · {drawMode} · {isAnimationEnabled ? "animated" : "static"} · {geometry.points.length} points
      </div>
    </section>
  );
}

const emptyAudioFrame = {
  volume: 0,
  bass: 0,
  mids: 0,
  highs: 0,
  waveform: [],
  frequency: []
};
