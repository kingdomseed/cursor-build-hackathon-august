const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "geniefinanz_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `token=${token}; path=/; SameSite=Lax`;
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = "token=; path=/; max-age=0";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: { email: string; name: string } }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  },
  accounts() {
    return request<{ accounts: import("./types").Account[] }>("/api/accounts");
  },
  transactions(accountId?: string) {
    const query = accountId
      ? `?accountId=${encodeURIComponent(accountId)}`
      : "";
    return request<{ transactions: import("./types").Transaction[] }>(
      `/api/transactions${query}`
    );
  },
  transaction(id: string) {
    return request<{ transaction: import("./types").Transaction }>(
      `/api/transactions/${encodeURIComponent(id)}`
    );
  },
  saveItems(id: string, items: import("./types").ReceiptItem[]) {
    return request<{ transaction: import("./types").Transaction }>(
      `/api/transactions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ items }),
      }
    );
  },
  resetDemoReceipts() {
    return request<{ ok: boolean }>("/api/demo/reset-receipts", {
      method: "POST",
    });
  },
  ocr(file: Blob, filename = "receipt.jpg") {
    const body = new FormData();
    body.append("image", file, filename);
    return request<{ items: import("./types").ReceiptItem[]; text: string }>(
      "/api/ocr",
      { method: "POST", body }
    );
  },
};
