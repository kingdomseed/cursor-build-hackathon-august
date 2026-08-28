# Reading receipts and invoices

## The question

GenieFinanz attaches receipts and invoices to bank charges and shows the itemized list next to the charge. The demo needs merchant, date, currency, total, line items (description + amount), and German VAT (7% / 19%, net/tax/gross) from phone photos of crumpled German receipts and from PDF invoices. Today the backend shells out to Tesseract (`backend/src/lib/ocr.ts`, `backend/src/app/api/ocr/route.ts`) and recovers items with regexes. Which extraction path should we use this weekend, and what is the post-hackathon path?

## Short answer

Keep Tesseract as a fallback, but for the demo send each receipt to a multimodal LLM (Gemini Flash or GPT-4o class) with a JSON schema: it gives line items and VAT in one call, costs well under a cent per receipt, and the team already has API keys. Regex over plain Tesseract text is the current weak point — receipts are not tables to Tesseract. After the hackathon, evaluate a dedicated OCR API (Mindee or Veryfi free tiers, AWS Textract AnalyzeExpense at $0.01/page) and pin down GDPR posture before sending real receipts to any US API.

## Findings

### 1. Tesseract self-hosted (status quo)

- Strengths: free, runs locally, no personal data leaves the machine, German traineddata already committed (`backend/deu.traineddata`). No signup, no quota.
- Weaknesses: Tesseract outputs plain text only. All structure — which line is an item, which is a total, which is VAT — has to be recovered by our own regexes (`parseReceiptItems` in `backend/src/lib/ocr.ts`). Skewed or crumpled phone photos degrade character accuracy, and there is no built-in concept of line items, VAT rates, or totals. This is the classic weak point of Tesseract for receipts: text is recoverable, table/line-item structure is not. (Local evidence: `backend/src/lib/ocr.ts`.)
- Cost: $0. Latency: a few seconds per image in tesseract.js (Node/WASM), cold-start worker spin-up included.
- Verdict within this option: fine as offline fallback and demo backup; cannot deliver the "wow" line-item + VAT moment reliably.

### 2. Mindee

- Features: pre-trained Receipt API extracts merchant, date, total, taxes; Invoice API extracts totals, dates, taxes, and line items (https://www.mindee.com/pricing FAQ; https://www.mindee.com/product/receipt-ocr-api; https://www.mindee.com/product/invoice-ocr-api).
- Cost: one credit = one physical page. Starter $53/month billed annually (6,000 credits/month, ≈$0.054/credit); Pro $134/month with data-processing localization option (https://www.mindee.com/pricing).
- Friction: "Try for free now" signup exists; free tier limits not published on the pricing page (see Unknowns).
- GDPR angle: French company; the Pro plan adds "data processing localization" — EU processing is available but gated above the entry plan (https://www.mindee.com/pricing).
- Fit: strong post-hackathon candidate; paid plans too heavy for a weekend demo.

### 3. Veryfi

- Features: receipt and invoice APIs returning structured line items, taxes, totals; 38 languages including German, 91 currencies (https://www.veryfi.com/pricing/, https://www.veryfi.com/receipt-ocr-api/).
- Cost: Free plan processes up to 100 docs/month at $0 (all document types). Paid: $0.08 per receipt, $0.16 per invoice; Starter tier has a $500/month minimum commitment (https://www.veryfi.com/pricing/).
- Friction: self-serve API signup (https://hub.veryfi.com/signup/api/), SDKs on GitHub. The free tier is genuinely enough for a demo.
- GDPR angle: states GDPR compliance and SOC 2 Type II, US-based (https://www.veryfi.com/pricing/ FAQ).
- Fit: most demo-friendly dedicated OCR API — 100 free receipts/month covers the whole hackathon.

### 4. Google Cloud Document AI (and Cloud Vision)

- Features: prebuilt Expense parser (formerly receipt parser) and Invoice parser; both return items/taxes/totals (https://cloud.google.com/document-ai/pricing).
- Cost: $0.10 per document for Invoice parser and Expense parser (1 count = up to 10 pages) (https://cloud.google.com/document-ai/pricing). Enterprise Document OCR alone is free for the first 1,000 pages/month, then $1.50 per 1,000 pages — but OCR-only is plain text, the same structural problem as Tesseract (https://cloud.google.com/document-ai/pricing).
- Friction: highest of the set — needs a GCP project, billing account, processor creation, service-account auth. A lot of console plumbing for a weekend.
- GDPR angle: EU regions available for Document AI processing (regional endpoints); still a US-headquartered provider.
- Fit: skip for the demo; plausible at scale if we standardize on GCP.

### 5. Azure AI Document Intelligence

- Features: prebuilt Receipt and Invoice models with defined schemas, plus Layout (tables) (https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/).
- Cost: free tier (F0) gives 0–500 pages/month free across all prebuilt models; S0 pay-as-you-go is $10 per 1,000 pages ($0.01/page) for prebuilt models (https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/).
- Friction: needs an Azure subscription and resource creation; $200 free credit for new accounts (https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/).
- GDPR angle: EU regions (e.g. Germany West Central, West Europe) available in the region picker (https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/).
- Fit: best free tier among the cloud prebuilt models (500 pages/month); moderate setup friction.

### 6. AWS Textract (AnalyzeExpense)

- Features: AnalyzeExpense is purpose-built for receipts and invoices, returning summary fields (vendor, date, total, taxes) and line items (https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html).
- Cost: $0.01 per page (first 1M pages/month); free tier for new AWS customers: 100 pages/month for three months (https://aws.amazon.com/textract/pricing/).
- Friction: needs an AWS account and IAM credentials; standard AWS setup.
- GDPR angle: EU regions (e.g. eu-central-1 Frankfurt) available.
- Fit: cheapest per-page dedicated option with a weekend-sized free tier; solid post-hackathon candidate.

### 7. Multimodal LLM extraction (GPT-4o class / Claude / Gemini) with structured JSON

- How it works: send the receipt photo or PDF page image with a prompt and a JSON schema (merchant, date, currency, total, items[{description, amount}], vat[{rate, net, tax, gross}]). Structured-output modes in all three APIs constrain the reply to the schema.
- Cost: very low per receipt. Gemini 2.5 Flash is $0.30 per million input tokens and $2.50 per million output tokens (https://ai.google.dev/gemini-api/docs/pricing; https://openrouter.ai/google/gemini-2.5-flash). A receipt photo is roughly 1,000–2,500 image tokens plus a short text prompt, and the JSON answer is a few hundred tokens — order of magnitude $0.001–0.002 per receipt, effectively free at hackathon volume. (Token math is inference from the published per-token prices.)
- Strengths: best structure recovery of the options — LLMs read layout and language, so German VAT blocks, mixed 7%/19% receipts, and crumpled-photo typos are handled in one call; no regexes; returns exactly the JSON shape our UI needs. The team already has API keys, so friction is near zero and integration is an hour of work.
- Weaknesses: output is non-deterministic; numbers can be wrong with no confidence signal, and Veryfi publicly argues LLMs are unreliable for financial figures (https://www.veryfi.com/pricing/ FAQ — note the vested interest). Mitigation for the demo: re-check that item amounts sum to the total in code and flag mismatches.
- GDPR angle: sending receipts to OpenAI/Anthropic/Google APIs is a third-party transfer; all three offer zero-retention or no-training API terms, but the transfer analysis still applies (see below).

### Data protection note (GDPR)

Receipts contain personal data (loyalty numbers, names, card tails, purchase habits). Sending them to a US-headquartered API is a third-country transfer under GDPR Chapter V (Art. 44–49, https://gdpr-info.eu/chapter-5/): it needs a lawful transfer basis — for most providers that is the EU–US Data Privacy Framework certification or Standard Contractual Clauses in a signed DPA — plus disclosure of the processor in the privacy notice, matching the repo's own compliance guidance in `research/germany-compliance-plaid.md` on data minimisation and subprocessor disclosure. Practical mitigations regardless of vendor: strip EXIF, don't store raw images longer than needed, prefer EU processing regions (offered by Azure, Google, AWS, and Mindee Pro) or self-hosted Tesseract when avoidance matters more than accuracy. For the hackathon, use synthetic or the team's own receipts only.

## Unknowns

- Mindee's free-tier limits after the pricing-page redesign ("Try for free now" is stated; volume caps are not published). Source: https://www.mindee.com/pricing.
- Head-to-head measured accuracy on crumpled German receipt photos for any option (including LLMs) — no trustworthy public benchmark found; would need a quick test set.
- Exact image-token billing for a typical phone-photo receipt on each LLM API (depends on resolution; only per-token prices are published).
- Whether Veryfi's 100 free docs/month include full line-item fields without add-ons (pricing page lists all document types on Free, but does not spell out field coverage).

## What this means for GenieFinanz

- Weekend choice: multimodal LLM with a JSON schema. Cheapest setup (keys already exist), best line-item + German VAT structure, one call per receipt, and the schema maps directly onto the existing `ReceiptItem` UI. Add a server-side check that items sum to the total; on mismatch, show the raw total and flag the receipt.
- Keep the Tesseract path as an offline fallback and as the privacy-safe option to mention in the demo ("we can run fully local if needed").
- Pre-fill the demo with 2–3 known-good receipts so a live-camera failure can't sink the pitch.
- Post-hackathon: run a small bake-off on ~20 real German receipts comparing the LLM against Veryfi (free tier, 100 docs/month), AWS Textract AnalyzeExpense (free tier 100 pages/month for 3 months, then $0.01/page), and Azure Document Intelligence (free tier 500 pages/month). Pick on measured accuracy, not marketing.
- Post-hackathon compliance: before real user receipts, sign DPAs with the chosen vendor, prefer EU processing regions, disclose the subprocessor per `research/germany-compliance-plaid.md`, and keep Tesseract as the no-transfer path for sensitive users.
- Skip Google Document AI and Mindee paid tiers for now: highest setup friction and monthly commitments the demo doesn't need.
