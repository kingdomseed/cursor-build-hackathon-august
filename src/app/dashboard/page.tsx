"use client";

import { AppHeader } from "@/components/AppHeader";
import { SpendingTab } from "@/components/SpendingTab";
import { api, getToken } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import type { Account, Transaction } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "spending" | "accounts";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("spending");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    Promise.all([api.accounts(), api.transactions()])
      .then(([accountData, txData]) => {
        setAccounts(accountData.accounts);
        setTransactions(txData.transactions);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen">
      <AppHeader subtitle={tab === "spending" ? "Spending" : "Accounts"} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex gap-2 rounded-full bg-slate-200/80 p-1">
          {(
            [
              ["spending", "Spending"],
              ["accounts", "Accounts"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
                tab === id
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-slate-500">Loading…</p> : null}
        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!loading && !error && tab === "spending" ? (
          <SpendingTab transactions={transactions} />
        ) : null}

        {!loading && !error && tab === "accounts" ? (
          <>
            <h1 className="mb-1 text-2xl font-semibold">Your accounts</h1>
            <p className="mb-6 text-sm text-slate-500">
              Connected banks and current balances
            </p>
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
          </>
        ) : null}
      </main>
    </div>
  );
}
