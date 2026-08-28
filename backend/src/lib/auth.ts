import { jsonResponse } from "./http";

export const DEMO_EMAIL = "demo@geniefinanz.de";
export const DEMO_PASSWORD = "genie1234";
export const SESSION_TOKEN = "geniefinanz-demo-session";

export function credentialsMatch(email: string, password: string) {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export function readToken(request: Request): string | undefined {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match?.[1];
}

export function isAuthenticated(request: Request) {
  return readToken(request) === SESSION_TOKEN;
}

export function unauthorized() {
  return jsonResponse({ error: "Unauthorized" }, 401);
}
