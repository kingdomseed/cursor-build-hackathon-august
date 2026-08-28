# Inquire and Analyze

Evidence and reasoning for cursor-build-hackathon-august / BelegGuru.

Status of claims: **fact** is from the repo or the checked-in schema. **inference** is an interpretation of the request. **unknown** needs a human answer.

---

## A1 — Explain and justify the need

### People and systems

- A demo user signs into BelegGuru (`demo@belegguru.de`) and sees one Commerzbank Girokonto plus receipt-mapped transactions. Source: `backend/src/lib/auth.ts`, `backend/data/transactions.json`, `frontend/src/app/page.tsx`.
- The Next.js backend (`belegguru-backend` on port 3001) serves `/api/auth/login`, `/api/accounts`, `/api/transactions`, and `/api/ocr`. Source: `backend/src/app/api/**`.
- The Next.js frontend (`belegguru-frontend` on port 3000) labels banks as "Connected" and maps OCR line items onto those transactions. Source: `frontend/src/app/dashboard/page.tsx`, `frontend/src/lib/api.ts`.
- `schemas/plaid-openapi.yml` is Plaid API version `2020-09-14_1.729.1`. It documents production (`https://production.plaid.com`) and sandbox (`https://sandbox.plaid.com`). Source: schema `info` and `servers`.

### Current situation

Accounts and transactions are a static JSON file. There is no Plaid client, no Link token flow, no access-token storage, and no mapping from Plaid account or transaction objects onto BelegGuru's `Account` / `Transaction` types. Source: `backend/src/lib/store.ts`, `backend/package.json` (no `plaid` dependency).

The dashboard copy already talks as if banks were connected. They are not. The file store is the whole data layer.

### What is wanted

The human asked to implement `schemas/plaid-openapi.yml` with the backend.

Two credible accounts of that request:

1. **Bank data for BelegGuru (recommended).** The backend becomes a Plaid client for the products BelegGuru already shows: Link, item/public_token exchange, accounts, transactions, and enough auth data to fill IBAN-like account numbers. Existing app routes and the receipt OCR flow stay. The schema is the contract for requests and responses, not a list of routes to clone.
2. **Re-host the full Plaid API.** The backend would expose every path in the 74k-line schema (assets, CRA, statements, investments, transfer, sandbox helpers, and more). BelegGuru does not call those products. Building them would not change the demo user's accounts or receipts.

Account 1 matches the existing product. Account 2 matches a literal reading of "implement this schema" and would stall a hackathon.

### Why it is worth doing, and why now

BelegGuru's stated job is "Map receipt line items to your bank transactions" (`frontend/src/app/page.tsx`). That only holds if the transactions can come from a bank. The schema is already in the repo and is the file the human has open.

### Boundaries

In:

- Typed calls from the backend to Plaid, grounded in the checked-in OpenAPI file.
- Link (or sandbox public-token) so at least one Item exists.
- Accounts and transactions available through the existing BelegGuru API so the dashboard and receipt scanner still work.

Out, unless the human overrides:

- Implementing every Plaid path as a first-party route.
- Replacing receipt OCR. Plaid does not supply line items; BelegGuru's `items` array is local (`backend/src/lib/ocr.ts`).
- Production bank credentials and real money movement.

Preserve:

- Demo login.
- Receipt scan and line-item save on a transaction.
- Frontend account/transaction shapes unless a later criterion changes them.

### Good outcome

A signed-in user can connect a Plaid sandbox institution (or a real bank later) and see those accounts and transactions in BelegGuru, then attach receipt items as today.

### Remaining A1 questions

1. Confirm account 1 (Plaid as BelegGuru's bank source) versus account 2 (full schema as backend routes).
2. Sandbox only for the hackathon, or production-shaped config from the start?
3. Keep the Commerzbank JSON as a fallback when Plaid keys are missing?

A1 is not complete until the human confirms this account of the need.

---

## A2 — Identify and prioritize research

Not started.

## A3 — Analyze prior art

Not started.

## A4 — Develop the Design Brief

Not started.
