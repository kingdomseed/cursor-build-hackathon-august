export function formatEUR(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export const categoryColors: Record<string, string> = {
  Groceries: "bg-emerald-50 text-emerald-700",
  Dining: "bg-orange-50 text-orange-700",
  Shopping: "bg-violet-50 text-violet-700",
  Transport: "bg-sky-50 text-sky-700",
  Subscriptions: "bg-rose-50 text-rose-700",
  Health: "bg-teal-50 text-teal-700",
};

export const categoryBarColors: Record<string, string> = {
  Groceries: "bg-emerald-500",
  Dining: "bg-orange-500",
  Shopping: "bg-violet-500",
  Transport: "bg-sky-500",
  Subscriptions: "bg-rose-500",
  Health: "bg-teal-500",
};
