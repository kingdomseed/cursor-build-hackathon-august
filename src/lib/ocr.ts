import type { ReceiptItem } from "./store";

const OCR_SPACE_URL = "https://api.ocr.space/parse/image";
const SKIP_PATTERN =
  /summe|total|zwischensumme|subtotal|mwst|steuer|vat\b|tax\b|datum|date\b|uhrzeit|kasse|filiale|danke|thank you|visa|mastercard|girocard|ec-karte|barzahlung|wechselgeld|bon-nr|steuernr|ust-id|tel\.|www\.|http|change due|cash|card payment|paid by/i;
const DATE_PATTERN = /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/;
const PRICE_TOKEN = /(?:€|EUR|\$)?\s*(\d+[.,]\s*\d{2})\s*(?:€|EUR|\$)?/i;

type OcrSpaceResponse = {
  ParsedResults?: { ParsedText?: string }[];
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  OCRExitCode?: number;
};

function ocrApiKey() {
  const key = process.env.OCR_SPACE_API_KEY?.trim();
  if (!key) {
    throw new Error("OCR_SPACE_API_KEY is not set");
  }
  return key;
}

function errorMessage(data: OcrSpaceResponse) {
  const message = data.ErrorMessage;
  if (Array.isArray(message)) return message.filter(Boolean).join(" ");
  return message || "OCR.space failed";
}

function toPrice(raw: string) {
  return Number.parseFloat(raw.replace(/\s/g, "").replace(",", "."));
}

function normalizeLine(raw: string) {
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/[.\u2024\u00B7_*]{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSkip(line: string) {
  if (line.length < 2) return true;
  if (SKIP_PATTERN.test(line)) return true;
  if (DATE_PATTERN.test(line) && !PRICE_TOKEN.test(line.replace(DATE_PATTERN, ""))) {
    return true;
  }
  return false;
}

export async function extractText(
  image: Buffer,
  mimeType = "image/jpeg"
): Promise<string> {
  const body = new FormData();
  body.set("apikey", ocrApiKey());
  body.set("language", "eng");
  body.set("isOverlayRequired", "false");
  body.set("isTable", "true");
  body.set("OCREngine", "2");
  body.set("scale", "true");
  body.set("detectOrientation", "true");
  body.set(
    "base64Image",
    `data:${mimeType};base64,${image.toString("base64")}`
  );

  const response = await fetch(OCR_SPACE_URL, { method: "POST", body });
  if (!response.ok) {
    throw new Error(`OCR.space HTTP ${response.status}`);
  }

  const data = (await response.json()) as OcrSpaceResponse;
  if (data.IsErroredOnProcessing) {
    throw new Error(errorMessage(data));
  }

  const text =
    data.ParsedResults?.map((result) => result.ParsedText ?? "").join("\n") ??
    "";
  return text.replace(/<br\s*\/?>/gi, "\n").trim();
}

function itemFromLine(line: string): ReceiptItem | null {
  const endMatch = line.match(
    /^(.*?)(?:\s+)(?:€|EUR|\$)?\s*(\d+[.,]\s*\d{2})\s*(?:€|EUR|\$)?\s*$/i
  );
  if (endMatch && endMatch[1].replace(/[\d\s.,€$%-]/g, "").length >= 2) {
    const name = endMatch[1].replace(/^\d+\s*[xX×]\s*/, "").trim();
    const price = toPrice(endMatch[2]);
    if (name && price > 0) return { name, price };
  }

  const startMatch = line.match(
    /^(?:€|EUR|\$)?\s*(\d+[.,]\s*\d{2})\s*(?:€|EUR|\$)?\s+(.+)$/i
  );
  if (startMatch && startMatch[2].replace(/[\d\s.,€$%-]/g, "").length >= 2) {
    const name = startMatch[2].trim();
    const price = toPrice(startMatch[1]);
    if (name && price > 0 && !/^\d+[.,]\d{2}$/.test(name)) {
      return { name, price };
    }
  }

  return null;
}

function onlyPrice(line: string): number | null {
  const match = line.match(
    /^(?:€|EUR|\$)?\s*(\d+[.,]\s*\d{2})\s*(?:€|EUR|\$)?$/i
  );
  if (!match) return null;
  const price = toPrice(match[1]);
  return price > 0 ? price : null;
}

export function parseReceiptItems(text: string): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  let pendingName = "";

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeLine(rawLine);
    if (!line) continue;

    const priceOnly = onlyPrice(line);
    if (priceOnly !== null && pendingName) {
      items.push({ name: pendingName, price: priceOnly });
      pendingName = "";
      continue;
    }

    if (shouldSkip(line)) {
      pendingName = "";
      continue;
    }

    const item = itemFromLine(line);
    if (item) {
      items.push(item);
      pendingName = "";
      continue;
    }

    if (/[a-zA-Z]{2,}/.test(line) && line.length < 60) {
      pendingName = line.replace(/^\d+\s*[xX×]\s*/, "").trim();
    } else {
      pendingName = "";
    }
  }

  return items;
}
