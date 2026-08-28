"use client";

import { AppHeader } from "@/components/AppHeader";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { api, getToken } from "@/lib/api";
import { categoryColors, formatDate, formatEUR } from "@/lib/format";
import type { ReceiptItem, Transaction } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function TransactionDetailPage() {
  const { id, txId } = useParams<{ id: string; txId: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }

    api
      .transaction(txId)
      .then((data) => setTransaction(data.transaction))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [txId, router]);

  const itemsTotal = useMemo(
    () =>
      (transaction?.items ?? []).reduce((sum, item) => sum + item.price, 0),
    [transaction]
  );

  async function persistItems(items: ReceiptItem[]) {
    const data = await api.saveItems(txId, items);
    setTransaction(data.transaction);
  }

  return (
    <div className="min-h-screen pb-16">
      <AppHeader subtitle="Transaction" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href={`/accounts/${id}`}
          className="text-sm text-teal-700 hover:underline"
        >
          ← Transactions
        </Link>

        {loading ? <p className="mt-6 text-slate-500">Loading…</p> : null}
        {error ? (
          <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {transaction ? (
          <>
            <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">
                    {transaction.merchant}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(transaction.date)}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      categoryColors[transaction.category] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {transaction.category}
                  </span>
                </div>
                <p
                  className={`text-2xl font-semibold ${
                    transaction.amount < 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {formatEUR(transaction.amount)}
                </p>
              </div>
            </section>

            {transaction.items.length > 0 ? (
              <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Receipt items</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="pb-2 font-medium">Item</th>
                      <th className="pb-2 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.items.map((item, index) => (
                      <tr key={`${item.name}-${index}`} className="border-b last:border-0">
                        <td className="py-2.5">{item.name}</td>
                        <td className="py-2.5 text-right font-medium">
                          {formatEUR(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-3 font-semibold">Items total</td>
                      <td className="pt-3 text-right font-semibold">
                        {formatEUR(itemsTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            ) : (
              <ReceiptScanner onSave={persistItems} />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
