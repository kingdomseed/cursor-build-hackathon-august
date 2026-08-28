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
  const byCategory = new Map<
    string,
    { total: number; items: Map<string, number> }
  >();

  for (const tx of transactions) {
    if (tx.amount >= 0) continue;

    const bucket = byCategory.get(tx.category) ?? {
      total: 0,
      items: new Map<string, number>(),
    };
    bucket.total += Math.abs(tx.amount);

    for (const item of tx.items) {
      bucket.items.set(item.name, (bucket.items.get(item.name) ?? 0) + item.price);
    }

    byCategory.set(tx.category, bucket);
  }

  return [...byCategory.entries()]
    .map(([category, data]) => ({
      category,
      total: data.total,
      items: [...data.items.entries()]
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total),
    }))
    .sort((a, b) => b.total - a.total);
}
