import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { readStore } from "@/lib/store";

export function GET(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();
  const { accounts } = readStore();
  return jsonResponse({ accounts });
}
