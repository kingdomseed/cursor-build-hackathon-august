# What Plaid actually gives us per transaction

## The question

What does Plaid's Transactions product return per transaction, how does the sync loop behave, and is the merchant data good enough to match a receipt against a bank charge?

## Short answer

Plaid gives one row per charge: amount, date, a cleaned merchant name, a counterparties object with a stable entity ID and logo, and a personal finance category. Positive amounts mean money left the account. Pending charges post later under a new transaction ID, linked back by `pending_transaction_id`. Updates arrive 1–4 times a day via a cursor-based sync plus webhooks. Plaid never returns receipt line items — a charge is a single amount with a merchant string, so our own receipt OCR is the only source of itemization.

## Findings

### 1. `/transactions/sync` mechanics

- **Cursor semantics.** Pass the saved `cursor` and the response returns only changes after it. Omit it and you get the full history. Max 500 updates per call; loop while `has_more` is true, then persist `next_cursor`. The final cursor is valid for at least 1 year. If a page fails mid-loop (`TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`), restart the whole loop from the cursor of the first page. (Source: `schemas/plaid-openapi.yml`, `TransactionsSyncRequest`/`TransactionsSyncResponse`, lines 24350–24475; https://plaid.com/docs/api/products/transactions/#transactionssync)
- **Three arrays.** Each response carries `added`, `modified`, and `removed` (removed items are `RemovedTransaction` objects — essentially just IDs). Apply all three to keep a local copy consistent; even posted transactions can change later (refund, recategorization). (Source: local spec `TransactionsSyncResponse`; https://plaid.com/docs/transactions/transactions-data/)
- **Historical depth.** Default is 90 days, set at Item creation via `transactions.days_requested` in `/link/token/create` (or on the first `/transactions/sync` call). Max 730 days (~24 months). It cannot be raised later without deleting the Item and re-linking. Some institutions cap history regardless — Capital One gives only 90 days. The first ~30 days are usually available almost immediately; the full history "may take a minute or more." (Source: https://plaid.com/docs/transactions/add-to-app/; https://plaid.com/docs/transactions/troubleshooting/)
- **Webhooks.** `SYNC_UPDATES_AVAILABLE` is the one to listen for with `/transactions/sync`; it carries `initial_update_complete` and `historical_update_complete` flags so you know when the 30-day fast pull and the full history are ready. `DEFAULT_UPDATE` (plus `INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `TRANSACTIONS_REMOVED`) is the older `/transactions/get` webhook set and still fires for backwards compatibility. You must call `/transactions/sync` once on an Item to activate `SYNC_UPDATES_AVAILABLE`. (Source: https://plaid.com/docs/api/products/transactions/ webhook table; https://plaid.com/docs/transactions/)
- **Update latency.** Plaid checks for new data 1–4 times per day depending on the institution; `/transactions/refresh` (paid add-on) forces an on-demand check. A US-vs-EU latency difference is not documented — see Unknowns. (Source: https://plaid.com/docs/transactions/#transactions-updates; local spec `/transactions/sync` description)

### 2. Transaction object fields that matter for receipt matching

All field definitions below are from `schemas/plaid-openapi.yml`, `TransactionBase` (line 30822) and `Transaction` (line 30948).

- **`amount`** — "Positive values when money moves out of the account; negative values when money moves in. For example, debit card purchases are positive; credit card payments, direct deposits, and refunds are negative." So a purchase and its credit-card bill payment have opposite signs on the card account, which is what lets us detect card-payment transfers.
- **`merchant_name`** — the merchant name "as enriched by Plaid from the `name` field," more human-readable; `null` for checks, transfers, and other non-merchant transactions. The older `name` field is deprecated in favor of it.
- **`counterparties`** (spec line 31932) — array of extracted parties, each with `name`, `type` (merchant, financial_institution, payment_app, marketplace, payment_terminal, income_source), `website`, `logo_url` (always a 100×100 PNG), `entity_id` ("a unique, stable, Plaid-generated ID"), and `confidence_level`. Also `merchant_entity_id` on the transaction itself, mapping to the broader merchant rather than a specific store location.
- **`personal_finance_category`** (spec line 32045) — `primary`, `detailed`, and `confidence_level`. Useful for filtering (e.g. `TRANSFER_IN`/`LOAN_PAYMENTS` style categories to spot card payments) but not needed for receipt matching itself.
- **`pending` / `pending_transaction_id`** — see section 5.
- **`authorized_date` vs `date`** — for posted transactions, `date` is the posted date and `authorized_date` is when the user actually made the purchase. Plaid recommends `authorized_date` for display. For receipts, `authorized_date` (when present) is the date to compare against the receipt date, since posting can lag 1–5 days.
- **`location`** — only populated for physical-location transactions, mostly large retail chains; small local businesses often have none. Not reliable as a matching key.
- **`payment_meta`** — legacy fields (reference number, payee, etc.), mostly sparsely populated.
- **EU/UK gaps.** No doc page found that lists per-field gaps for EU connections; the spec notes counterparty bank `account_numbers` are "currently only filled in for select financial institutions in Europe." Field-level EU differences beyond that are unverified — see Unknowns.

### 3. Reliability of merchant identity for matching a receipt vendor string

- Merchant-name fill rate is ~97% for transactions that have a merchant (excludes cash, deposits, fees); `personal_finance_category` fills ~95%. (Source: https://plaid.com/docs/transactions/#typical-fill-rates-for-selected-fields)
- Plaid parses the raw bank description into a cleansed name. Counterparty `confidence_level` values: `VERY_HIGH` (>98% confident), `HIGH` (>90%), `MEDIUM` (details may differ), `LOW` (no match in Plaid's records — the name is just a cleaned parse of the raw description), `UNKNOWN`. (Source: local spec `TransactionCounterparty`, line 31932)
- `entity_id` / `merchant_entity_id` are stable Plaid-generated IDs per merchant, so once a receipt vendor is matched to an entity, later charges from the same merchant can be matched by ID instead of by string. Logos and websites come along for free (100×100 PNGs) for display. (Source: local spec `Transaction`/`TransactionCounterparty`)
- Names and amounts can differ between pending and posted versions (e.g. tip added at posting), so matching should prefer posted transactions. (Source: https://plaid.com/docs/transactions/transactions-data/)
- Plaid's enrichment pipeline is also sold separately as the Enrich product (`/enrich/transactions`) for transactions that did not come through Plaid, but for Transactions customers the same enrichment is already inline. (Source: https://plaid.com/docs/enrich/)

### 4. Does Plaid offer receipt-level or line-item data?

No. The Transactions product returns one record per charge: date, amount, category, merchant, location (https://plaid.com/docs/transactions/#overview). Enrich adds merchant, category, and location insights — still per transaction, not per item (https://plaid.com/products/enrich/). No Plaid product or endpoint returns receipt line items; nothing matching line-item or receipt data appears in the Transactions or Enrich docs or in the local OpenAPI spec (searched `schemas/plaid-openapi.yml`). GenieFinanz's own receipt/invoice OCR is therefore the only source of itemization, and the Plaid charge is just the anchor we match it to.

### 5. Gotchas for an app that stores its own copy

- **Pending → posted is remove + add, not an update.** The pending `transaction_id` shows up in `removed`; the posted charge is a new `transaction_id` in `added`, with `pending_transaction_id` pointing back at the pending one. Match on that field to avoid double-counting. Some institutions (Capital One, USAA) never send pending transactions at all, and in rare cases Plaid fails to match the pair, leaving `pending_transaction_id` null. (Source: https://plaid.com/docs/transactions/transactions-data/)
- **Pending details shift.** Name and amount can change between pending and posted (tips); authorization holds (gas stations, hotels, rental cars) may vanish entirely without posting. (Source: same)
- **Posted is not immutable.** Refunds and recategorizations arrive later in `modified`; apply all three arrays. (Source: same)
- **transaction_id stability.** Posted transaction IDs are stable for the life of the Item, but the ID is per-Item — if the user links the same bank account twice (two Items), the same real-world charge appears twice with different IDs; Plaid suggests duplicate-Item handling. (Source: https://plaid.com/docs/transactions/troubleshooting/#duplicate-transactions-are-returned)
- **Removed transactions must be deleted locally**, keyed off the `removed` array (or `TRANSACTIONS_REMOVED` webhook). (Source: https://plaid.com/docs/api/products/transactions/#transactions_removed)
- **Null merchant_name.** ~3% of merchant transactions lack an enriched name; checks/transfers have none by design. Fall back to the deprecated `name` field or `original_description` (only returned if `options.include_original_description` is set). (Source: fill-rate table cited above; local spec `TransactionBase.name`/`merchant_name`)
- **Cursor discipline.** Save the cursor only after `has_more` is false; keep the page-one cursor during pagination in case of `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`. (Source: https://plaid.com/docs/transactions/add-to-app/)

## Unknowns

- Whether update latency or historical depth differs for EU/UK banks versus US banks — no Plaid doc states this.
- Exact per-field gaps for European connections (e.g. whether `merchant_name`, `location`, or counterparties enrichment rates differ) — not documented on a page I could reach.
- The real-world accuracy of fuzzy string matching between receipt OCR vendor strings and `merchant_name` — needs testing against Sandbox data (`user_transactions_dynamic`).
- Whether `merchant_entity_id` coverage extends to small German/EU merchants at usable rates.

## What this means for GenieFinanz

Plaid gives us everything needed to anchor a receipt to a charge: a stable ID, an out-of-account positive amount, an authorized date, and a cleaned merchant name with a stable entity ID. It gives nothing below the charge level — receipt OCR is ours to build. For the "don't double-count card payments" feature, the sign convention plus `personal_finance_category` (transfer/payment categories) plus matching equal-and-opposite amounts across the checking and credit accounts is enough.

**Minimum fields to store per transaction:**

1. `transaction_id` (primary key, per Item)
2. `account_id` (needed to tell checking from credit card)
3. `amount` + `iso_currency_code`
4. `date` and `authorized_date`
5. `pending` and `pending_transaction_id`
6. `merchant_name` (fall back to `name`)
7. `merchant_entity_id` and top counterparty `entity_id` + `confidence_level`
8. `personal_finance_category.primary` / `.detailed`
9. `logo_url` (display only)

**Matching sketch (receipt → charge):**

1. Filter candidate charges: posted (or pending, flagged) transactions where `abs(amount)` equals the receipt total, within a small tolerance for tip/tax (±2–5%).
2. Narrow by date: `authorized_date` (or `date`) within ±5 days of the receipt date.
3. Score merchant similarity: normalize both strings (lowercase, strip punctuation/legal suffixes), then compare with token overlap or Levenshtein; boost the score when a stored `merchant_entity_id` has matched this vendor before.
4. Pick the best-scoring candidate above a threshold; below the threshold, queue for manual user confirmation and learn the mapping (vendor string → `merchant_entity_id`) from the confirmation.
5. On sync, when a pending transaction posts (`pending_transaction_id`), carry the receipt attachment over from the removed pending row to the new posted row automatically.
