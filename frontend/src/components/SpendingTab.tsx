"use client";

import { categoryBarColors, categoryColors, formatEUR } from "@/lib/format";
import { aggregateSpending, MONTHLY_BUDGET_EUR } from "@/lib/spending";
import type { Transaction } from "@/lib/types";
import { useMemo, useState } from "react";

function BudgetCard({ spent }: { spent: number }) {
  const remaining = MONTHLY_BUDGET_EUR - spent;
  const usedRatio = Math.min(1, spent / MONTHLY_BUDGET_EUR);
  const over = remaining < 0;

  return (
    <section className="mb-6 rounded-2xl bg-navy-900 p-5 text-white shadow-sm">
      <p className="text-xs uppercase tracking-widest text-teal-400">
        Monthly budget
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {formatEUR(MONTHLY_BUDGET_EUR)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Spent</p>
          <p className="mt-0.5 font-semibold">{formatEUR(spent)}</p>
        </div>
        <div>
          <p className="text-slate-400">Remaining</p>
          <p className={`mt-0.5 font-semibold ${over ? "text-rose-300" : "text-teal-400"}`}>
            {formatEUR(remaining)}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${over ? "bg-rose-400" : "bg-teal-400"}`}
          style={{ width: `${Math.max(4, usedRatio * 100)}%` }}
        />
      </div>
    </section>
  );
}

export function SpendingTab({ transactions }: { transactions: Transaction[] }) {
  const categories = useMemo(
    () => aggregateSpending(transactions),
    [transactions]
  );
  const [selected, setSelected] = useState<string | null>(null);

  const totalSpend = categories.reduce((sum, cat) => sum + cat.total, 0);
  const active = categories.find((cat) => cat.category === selected) ?? null;

  if (active) {
    const maxItem = active.items[0]?.total ?? 1;

    return (
      <div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-sm text-teal-700 hover:underline"
        >
          ← All categories
        </button>
        <h1 className="mt-3 text-2xl font-semibold">{active.category}</h1>
        <p className="mb-6 text-sm text-slate-500">
          {formatEUR(active.total)} spent · top items
        </p>

        {active.items.length === 0 ? (
          <p className="text-sm text-slate-500">No line items in this category yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm">
            {active.items.map((item) => (
              <li key={item.name} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="shrink-0 font-semibold text-navy-900">
                    {formatEUR(item.total)}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      categoryBarColors[active.category] ?? "bg-navy-800"
                    }`}
                    style={{ width: `${Math.max(8, (item.total / maxItem) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Spending</h1>
      <p className="mb-4 text-sm text-slate-500">
        {formatEUR(totalSpend)} spent across {categories.length} categories
      </p>

      <BudgetCard spent={totalSpend} />

      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.category}>
            <button
              type="button"
              onClick={() => setSelected(cat.category)}
              className="w-full rounded-2xl bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoryColors[cat.category] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.category}
                </span>
                <span className="font-semibold">{formatEUR(cat.total)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    categoryBarColors[cat.category] ?? "bg-navy-800"
                  }`}
                  style={{
                    width: `${Math.max(8, (cat.total / (categories[0]?.total || 1)) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {cat.items.length} items · tap to see the top ones
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
