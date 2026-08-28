import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/http";
import { readStore, writeStore, type ReceiptItem } from "@/lib/store";

export function OPTIONS() {
  return optionsResponse();
}

type Params = { params: { id: string } };

export function GET(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) return unauthorized();

  const { transactions } = readStore();
  const transaction = transactions.find((tx) => tx.id === params.id);
  if (!transaction) {
    return jsonResponse({ error: "Transaction not found" }, 404);
  }

  return jsonResponse({ transaction });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isAuthenticated(request)) return unauthorized();

  let body: { items?: ReceiptItem[] };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!Array.isArray(body.items)) {
    return jsonResponse({ error: "items must be an array" }, 400);
  }

  const store = readStore();
  const index = store.transactions.findIndex((tx) => tx.id === params.id);
  if (index === -1) {
    return jsonResponse({ error: "Transaction not found" }, 404);
  }

  const items = body.items
    .filter(
      (item) =>
        typeof item?.name === "string" &&
        item.name.trim().length > 0 &&
        typeof item.price === "number" &&
        Number.isFinite(item.price)
    )
    .map((item) => ({ name: item.name.trim(), price: item.price }));

  store.transactions[index] = { ...store.transactions[index], items };
  writeStore(store);

  return jsonResponse({ transaction: store.transactions[index] });
}
