import { isAuthenticated, unauthorized } from "@/lib/auth";
import { jsonResponse, optionsResponse } from "@/lib/http";
import { readStore } from "@/lib/store";

export function OPTIONS() {
  return optionsResponse();
}

export function GET(request: Request) {
  if (!isAuthenticated(request)) return unauthorized();
  const { accounts } = readStore();
  return jsonResponse({ accounts });
}
