"use client";

import { AppHeader } from "@/components/AppHeader";
import { api, getToken } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import type { Account } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    api
      .accounts()
      .then((data) => setAccounts(data.accounts))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load accounts")
      )
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen">
      <AppHeader subtitle="Accounts" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-semibold">Your accounts</h1>
        <p className="mb-6 text-sm text-slate-500">
          Connected banks and current balances
        </p>

        {loading ? <p className="text-slate-500">Loading…</p> : null}
        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <ul className="space-y-4">
          {accounts.map((account) => (
            <li key={account.id}>
              <Link
                href={`/accounts/${account.id}`}
                className="block overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-lg transition hover:scale-[1.01]"
              >
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-teal-400">
                      {account.bankName}
                    </p>
                    <p className="mt-1 text-lg font-medium">
                      {account.accountType}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Connected
                  </span>
                </div>
                <p className="text-3xl font-semibold tracking-tight">
                  {formatEUR(account.balance)}
                </p>
                <p className="mt-3 font-mono text-sm tracking-wide text-slate-300">
                  {account.iban}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
