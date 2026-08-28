import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { extractText, parseReceiptItems } from "@/lib/ocr";

export const maxDuration = 30;

export async function POST(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "Expected multipart form data" }, 400);
  }

  const file = formData.get("image") ?? formData.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "Missing image file" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";

  try {
    const text = await extractText(buffer, mimeType);
    const items = parseReceiptItems(text);
    return jsonResponse({ items, text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR failed";
    return jsonResponse({ error: message }, 502);
  }
}
