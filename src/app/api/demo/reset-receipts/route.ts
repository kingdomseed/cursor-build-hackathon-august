import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { readStore, writeStore } from "@/lib/store";

export function POST(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();

  const store = readStore();
  store.transactions = store.transactions.map((tx) =>
    tx.resetOnSession ? { ...tx, items: [] } : tx
  );
  writeStore(store);

  return jsonResponse({ ok: true });
}
