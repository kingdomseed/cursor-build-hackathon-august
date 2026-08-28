import type { Transaction } from "./types";

export const MONTHLY_BUDGET_EUR = 400;

export type ItemSpend = {
  name: string;
  total: number;
};

export type CategorySpend = {
  category: string;
  total: number;
  items: ItemSpend[];
};

export function aggregateSpending(transactions: Transaction[]): CategorySpend[] {
  const byCategory: Record<
    string,
    { total: number; items: Record<string, number> }
  > = {};

  for (const tx of transactions) {
    if (tx.amount >= 0) continue;

    const bucket = byCategory[tx.category] ?? { total: 0, items: {} };
    bucket.total += Math.abs(tx.amount);

    for (const item of tx.items) {
      bucket.items[item.name] = (bucket.items[item.name] ?? 0) + item.price;
    }

    byCategory[tx.category] = bucket;
  }

  return Object.entries(byCategory)
    .map(([category, data]) => ({
      category,
      total: data.total,
      items: Object.entries(data.items)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => b.total - a.total);
}
