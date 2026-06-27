import { downloadBlob, slugForFilename, timestampForFilename } from "@/lib/export/download";

interface CanvasExportSource {
  canvas: HTMLCanvasElement;
  renderTransparentCanvas?: () => HTMLCanvasElement;
}

let activeSource: CanvasExportSource | null = null;

export function setActiveCanvas(source: CanvasExportSource | null): void {
  activeSource = source;
}

export async function downloadActiveCanvasPng(presetName: string, transparentBackground: boolean): Promise<void> {
  if (!activeSource) {
    throw new Error("No active canvas is available for PNG export.");
  }

  const exportCanvas =
    transparentBackground && activeSource.renderTransparentCanvas
      ? activeSource.renderTransparentCanvas()
      : activeSource.canvas;
  const blob = await canvasToPngBlob(exportCanvas);
  downloadBlob(
    `sonicfield-${slugForFilename(presetName || "pattern")}-${timestampForFilename()}.png`,
    blob
  );
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Canvas PNG export failed."));
    }, "image/png");
  });
}
