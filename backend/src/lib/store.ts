import fs from "fs";
import path from "path";

export type ReceiptItem = {
  name: string;
  price: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: ReceiptItem[];
  resetOnSession?: boolean;
};

export type Account = {
  id: string;
  bankName: string;
  iban: string;
  balance: number;
  currency: string;
  accountType: string;
};

export type Store = {
  accounts: Account[];
  transactions: Transaction[];
};

const DATA_PATH = path.join(process.cwd(), "data", "transactions.json");

export function readStore(): Store {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Store;
}

export function writeStore(store: Store) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), "utf-8");
}
