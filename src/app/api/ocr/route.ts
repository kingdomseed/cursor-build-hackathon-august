import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { parseReceiptItems } from "@/lib/ocr";

export async function POST(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Expected JSON { text }" }, 400);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { text?: unknown }).text !== "string"
  ) {
    return jsonResponse({ error: "Expected JSON { text }" }, 400);
  }

  const text = (body as { text: string }).text;
  return jsonResponse({ items: parseReceiptItems(text), text });
}
