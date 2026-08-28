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

const SEED_PATH = path.join(process.cwd(), "data", "transactions.json");

function writablePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "transactions.json");
  }
  return SEED_PATH;
}

export function readStore(): Store {
  const target = writablePath();
  if (!fs.existsSync(target)) {
    const seed = fs.readFileSync(SEED_PATH, "utf-8");
    if (target !== SEED_PATH) {
      fs.writeFileSync(target, seed, "utf-8");
    }
    return JSON.parse(seed) as Store;
  }
  return JSON.parse(fs.readFileSync(target, "utf-8")) as Store;
}

export function writeStore(store: Store) {
  fs.writeFileSync(writablePath(), JSON.stringify(store, null, 2), "utf-8");
}
