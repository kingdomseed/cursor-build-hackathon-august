"use client";

import { api } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import type { ReceiptItem } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Mode = "upload" | "camera";

export function ReceiptScanner({
  onSave,
}: {
  onSave: (items: ReceiptItem[]) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [items, setItems] = useState<ReceiptItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (mode !== "camera") {
      stopCamera();
      return;
    }

    let cancelled = false;
    setError("");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setCameraOn(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Camera access was denied or is unavailable.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOn || !video || !stream) return;
    video.srcObject = stream;
    void video.play();
  }, [cameraOn]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((next) => {
      if (!next) return;
      setBlob(next);
      setPreview(URL.createObjectURL(next));
      setItems(null);
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    setBlob(file);
    setPreview(URL.createObjectURL(file));
    setItems(null);
    setError("");
  }

  async function scan() {
    if (!blob) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.ocr(blob);
      setItems(result.items);
      if (result.items.length === 0) {
        const snippet = result.text?.trim().slice(0, 280);
        setError(
          snippet
            ? `No priced line items found. OCR text started with: “${snippet}”`
            : "No priced line items found. Try a clearer photo of the receipt."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!items) return;
    setSaving(true);
    setError("");
    try {
      await onSave(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save items");
    } finally {
      setSaving(false);
    }
  }

  function updateItem(index: number, patch: Partial<ReceiptItem>) {
    setItems((current) =>
      current
        ? current.map((item, i) => (i === index ? { ...item, ...patch } : item))
        : current
    );
  }

  function removeItem(index: number) {
    setItems((current) => current?.filter((_, i) => i !== index) ?? null);
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Add a receipt image</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">
        This transaction has no line items yet. Upload a photo or use your
        camera so OCR can map each item onto it.
      </p>

      <div className="mb-4 flex gap-2">
        {(["upload", "camera"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              mode === option
                ? "bg-navy-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {option === "upload" ? "Upload file" : "Use camera"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-dashed border-slate-300 px-4 py-8 w-full text-sm text-slate-500 hover:border-teal-500 hover:text-teal-700"
          >
            Choose a receipt image
          </button>
        </div>
      ) : (
        <div>
          {cameraOn ? (
            <div className="space-y-3">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full rounded-xl bg-black"
              />
              <button
                type="button"
                onClick={captureFrame}
                className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white"
              >
                Capture
              </button>
            </div>
          ) : preview ? null : (
            <p className="text-sm text-slate-500">Starting camera…</p>
          )}
        </div>
      )}

      {preview ? (
        <img
          src={preview}
          alt="Receipt preview"
          className="mt-4 max-h-64 rounded-xl object-contain"
        />
      ) : null}

      {blob ? (
        <button
          type="button"
          onClick={scan}
          disabled={busy}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
        >
          {busy ? "Scanning…" : "Scan receipt"}
        </button>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {items && items.length > 0 ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold">Parsed items</h3>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex gap-2">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(index, { price: Number(e.target.value) })
                  }
                  className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-right text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-rose-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-slate-500">
            Parsed total {formatEUR(items.reduce((sum, item) => sum + item.price, 0))}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-3 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save to transaction"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
