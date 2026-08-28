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
};

export type Account = {
  id: string;
  bankName: string;
  iban: string;
  balance: number;
  currency: string;
  accountType: string;
};
