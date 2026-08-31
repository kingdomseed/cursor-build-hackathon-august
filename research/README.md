# Research

What we needed to know before building GenieFinanz, what the answer is, and where the details live. Gathered 28 Aug 2026 for Criterion A2 — Identify and prioritize research. Every claim in the linked files carries a source.

## The questions, in the order that decides things

### 1. Can one provider cover North America and Europe?

Yes. Plaid's Transactions product covers 18 European countries, and Germany is its largest EU market: 1,006 institutions in Plaid's own coverage file, including the Sparkasse and Volksbank/Raiffeisenbank networks. Tink is sales-led and gates its business product behind enterprise contracts. A small team can start on Plaid's free trial (10 production Items) today.

Details: [plaid-europe.md](plaid-europe.md)

One regulatory caveat applies to Plaid, Tink, and anyone else: an app that shows consolidated account data generally needs its own AISP registration or an agent arrangement. See the compliance note below.

**Proposed README change** (the Tink line is out of date):

> Plaid pulls the US, Canada, and Europe, Germany included, so I am not talking to each bank myself. I have not signed anyone. If Plaid falls through, Tink or Enable Banking are the fallback.

### 2. What does Plaid give us per transaction?

Enough to match receipts to charges. Sync is cursor-based with added/modified/removed sets. Positive amount means money left the account, so the checking-to-card payment is detectable as equal-and-opposite amounts. Merchant identity is strong: merchant_name fills on ~97% of merchant transactions, and counterparties carry stable entity IDs with confidence levels. Pending becomes posted as a remove-plus-add pair linked by pending_transaction_id, and amounts can change at posting, so match receipts against posted charges only. Plaid has no receipt or line-item data anywhere: our OCR is the only source of itemization. That is the product.

Details, the nine fields to store, and the matching sketch: [plaid-transactions.md](plaid-transactions.md)

Open unknown: whether EU connections return the same fields and latency as US ones is undocumented.

### 3. How do we read the receipts?

For the demo: a multimodal LLM with a JSON schema, which the team already has via Nikhil's Gemini Flash key. It returns line items and VAT in one call for well under a cent per receipt, and it replaces the regex layer that Tesseract forces on us. Tesseract stays as the offline fallback. After the hackathon, bake off the LLM against the dedicated receipt APIs (Veryfi, Textract AnalyzeExpense, Azure) on real German receipts, then sign DPAs and pin down EU regions before real user data touches any US API.

Details: [receipt-ocr.md](receipt-ocr.md)

### 4. Who else does this?

Nobody, in this shape. B2C apps (Monarch, Simplifi, YNAB and friends) attach receipts but treat them as dead pixels: no line items, no VAT. They do handle transfer and card-payment matching. B2B tools (Pleo, Moss, Ramp) read receipts properly but want to issue you their card first. The ones that work with any card (Expensify, Circula, Yokoy, QuickBooks) are finance-team workflows, not a personal charge-by-charge view. The wedge: itemized proof on your own accounts, transfer matching, person and small business in one ledger, VAT-aware and DATEV-exportable for Germany.

Details and the pitch line: [prior-art.md](prior-art.md)

### 5. Does the compliance guide hold up?

Mostly. The Plaid claims check out: EEA data stored in US AWS regions under adequacy and SCCs; Plaid Financial Ltd. (FCA) and Plaid B.V. (DNB) are the regulated entities; disconnection triggers deletion with six listed exceptions. Two corrections: the AI Act dates moved (transparency duties apply since 2 Aug 2026, high-risk rules pushed to Dec 2027; our OCR and matching is minimal-risk, so the duty is labeling AI interactions), and a DPIA is likely mandatory rather than optional, because the German DSK list covers cross-account data merging and purchasing-behavior profiles. The ZAG perimeter opinion is still needed before launch.

Details: [compliance-verification.md](compliance-verification.md), original brief: [germany-compliance-plaid.md](germany-compliance-plaid.md)

## What this decides

- **Build:** Plaid-only. Store the nine transaction fields. Match receipts to posted charges by amount tolerance, date window, and merchant similarity. Extract receipts with Gemini Flash, keep Tesseract as fallback.
- **Pitch:** the wedge in prior-art.md, plus the line "Monarch shows the charge; Pleo shows finance the VAT; GenieFinanz shows the coffee, the milk, and the tax."
- **Homework before real users:** DPIA, ZAG perimeter opinion, DPA and subprocessor disclosure for the OCR API, privacy/terms/Impressum.
