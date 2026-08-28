import type { ReceiptItem } from "./types";

const SKIP_PATTERN =
  /summe|total|zwischensumme|mwst|steuer|datum|uhrzeit|kasse|filiale|danke|thank|visa|mastercard|girocard|ec-karte|barzahlung|wechselgeld|betrag|zahlung|bon-nr|steuernr|ust-id|tel\.|www\.|http/i;

export function parseReceiptItems(text: string): ReceiptItem[] {
  const items: ReceiptItem[] = [];
  const priceRe = /^(.*?)(?:\s{2,}|\s+)(\d+[.,]\d{2})\s*(?:€|EUR)?\s*$/i;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (line.length < 3) continue;
    if (SKIP_PATTERN.test(line)) continue;

    const match = line.match(priceRe);
    if (!match) continue;

    const name = match[1].replace(/^\d+\s*[xX]\s*/, "").trim();
    const price = Number.parseFloat(match[2].replace(",", "."));
    if (!name || Number.isNaN(price) || price <= 0) continue;

    items.push({ name, price });
  }

  return items;
}
