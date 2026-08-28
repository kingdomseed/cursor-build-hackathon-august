import type { Worker } from "tesseract.js";

const MAX_EDGE = 1800;
const OCR_LANG = "deu";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker(OCR_LANG, 1, {
        langPath: `${window.location.origin}/tessdata`,
        gzip: false,
        workerBlobURL: false,
        workerPath:
          "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core.wasm.js",
      });
    })().catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

export async function downscaleReceipt(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close();
    return image;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return image;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const next = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.85);
  });
  return next ?? image;
}

export async function recognizeReceipt(image: Blob): Promise<string> {
  const resized = await downscaleReceipt(image);
  const worker = await getWorker();
  const { data } = await worker.recognize(resized);
  return data.text ?? "";
}
