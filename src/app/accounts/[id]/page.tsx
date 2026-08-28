"use client";

import { AppHeader } from "@/components/AppHeader";
import { api, getToken } from "@/lib/api";
import { categoryColors, formatDate, formatEUR } from "@/lib/format";
import type { Account, Transaction } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    Promise.all([api.accounts(), api.transactions(id)])
      .then(([accountData, txData]) => {
        setAccount(
          accountData.accounts.find((item) => item.id === id) ?? null
        );
        setTransactions(txData.transactions);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [id, router]);

  return (
    <div className="min-h-screen">
      <AppHeader subtitle={account?.bankName ?? "Account"} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/dashboard"
          className="text-sm text-teal-700 hover:underline"
        >
          ← All accounts
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">
          {account?.bankName ?? "Account"}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {account ? `${account.iban} · ${formatEUR(account.balance)}` : ""}
        </p>

        {loading ? <p className="text-slate-500">Loading…</p> : null}
        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <Link
                href={`/accounts/${id}/transactions/${tx.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{tx.merchant}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {formatDate(tx.date)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        categoryColors[tx.category] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.category}
                    </span>
                    {tx.items.length > 0 ? (
                      <span className="text-xs text-slate-400">
                        {tx.items.length} items
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Needs receipt
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={`shrink-0 font-semibold ${
                    tx.amount < 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {formatEUR(tx.amount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
