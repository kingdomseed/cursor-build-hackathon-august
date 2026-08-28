"use client";

import { clearToken } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/");
  }

  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold">
            B
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">BelegGuru</p>
            {subtitle ? (
              <p className="text-xs text-slate-300">{subtitle}</p>
            ) : null}
          </div>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
