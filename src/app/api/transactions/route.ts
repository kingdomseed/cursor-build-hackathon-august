import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { readStore } from "@/lib/store";

export function GET(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const { transactions } = readStore();

  const filtered = accountId
    ? transactions.filter((tx) => tx.accountId === accountId)
    : transactions;

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  return jsonResponse({ transactions: sorted });
}
