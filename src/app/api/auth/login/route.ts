import { credentialsMatch, SESSION_TOKEN } from "@/lib/auth";
import { jsonResponse } from "@/lib/http";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!credentialsMatch(email, password)) {
    return jsonResponse({ error: "Invalid email or password" }, 401);
  }

  const response = NextResponse.json(
    {
      token: SESSION_TOKEN,
      user: { email, name: "Demo User" },
    },
    { status: 200 }
  );

  response.cookies.set("token", SESSION_TOKEN, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
