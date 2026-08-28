import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/http";
import { extractText, parseReceiptItems } from "@/lib/ocr";

export function OPTIONS() {
  return optionsResponse();
}

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
  const text = await extractText(buffer);
  const items = parseReceiptItems(text);

  return jsonResponse({ items, text });
}
