# Who else does this, and where the gap is

## The question

GenieFinanz syncs transactions from a user's existing accounts (Plaid), attaches receipts or invoices to charges, extracts line items and VAT, and matches the checking-account payment to the credit-card payment so card spend is not double-counted. Who already does this, and where is the gap?

## Short answer

Personal finance apps (Monarch, Simplifi, Lunch Money, PocketGuard) let you attach receipts to transactions and handle transfers so card payments are not double-counted — but none of them extract line items or VAT from the receipt. Business expense tools (Pleo, Moss, Ramp, Brex) extract receipt data well, including VAT, but most are built around issuing their own corporate card. Tools that work with any card or account (Expensify, Circula, Yokoy, QuickBooks) are expense-report workflows aimed at employees and finance teams, not a personal view of "this charge, here's what I actually bought." Nobody combines: your own accounts, itemized receipt proof, and transfer matching, for both personal and small-business use.

## Findings

### B2C — personal finance apps

| Product | Receipt attach | Line items from receipt | Own-account / card-payment matching | Notes and sources |
| --- | --- | --- | --- | --- |
| Copilot Money | No — users on Reddit report there is no receipt attachment feature ([reddit](https://www.reddit.com/r/copilotmoney/comments/1ddfta9/receipts_attachments/)) | No | Yes — three transaction types including transfers; card payments handled as transfers ([help](https://help.copilot.money/en/articles/3971267-transaction-types)) | Strong design, US-only, iOS/Mac |
| Monarch Money | Yes — notes and attachments on transactions, plus a Receipts inbox with email-in and scanning ([help](https://help.monarch.com/hc/en-us/articles/360056422791), [help](https://help.monarch.com/hc/en-us/articles/44244210547860)) | Unknown — receipt scanning "extracts data" to create transactions; public docs do not promise line-item or VAT extraction | Yes — explicit docs on transfers and credit-card payments to avoid double-counting ([help](https://help.monarch.com/hc/en-us/articles/360048393292)) | Closest B2C competitor on receipts; still no itemization |
| YNAB | Yes — photos and memos on transactions ([support](https://support.ynab.com/en_us/add-context-to-transactions-HyCpTR4bg)) | No — third-party ecosystem (Receipts for YNAB, Snapt) exists because YNAB does not parse line items ([app store](https://apps.apple.com/us/app/receipts-for-ynab/id6755055273)) | Yes — zero-based budgeting treats card payments as transfers, not spend | Budgeting-first; receipts are decoration, not data |
| Quicken Simplifi | Yes — attach receipts to transactions on web and mobile ([help](https://support.simplifi.quicken.com/en/articles/3348103)) | No evidence of line-item extraction | Yes — dedicated transfer handling incl. credit-card payments in the Spending Plan ([help](https://support.simplifi.quicken.com/en/articles/5142302)) | — |
| Lunch Money | Yes — drag-and-drop attachments area on transactions ([help](https://support.lunchmoney.app/finances/transactions/transaction-enhancements)) | No | Yes — dedicated "Payment, Transfer" category so these are not counted as income/expense ([help](https://support.lunchmoney.app/finances/transactions/transaction-actions)) | Indie app; Amazon receipt matching is a DIY API project ([docs](https://lunchmoney.dev/)) |
| PocketGuard | Yes — attach receipt images from the app ([help](https://help.pocketguard.com/hc/en-us/articles/360002196479)) | No | Partial — hashtags and categories; no documented auto-matching of card payments to bank debits | — |
| Finanzguru (DE) | No — receipt photos are a long-standing user wish, not a feature ([community](https://community.finanzguru.de/de/communities/7/topics/599)) | No | Yes — "Umbuchung" (transfer) recognition between connected accounts, so transfers cancel out ([help](https://hilfe.finanzguru.de/de/articles/3490178)) | Known double-counting pain with PayPal-style wallets ([reddit](https://www.reddit.com/r/Finanzen/comments/1fwb2kf/)) |
| Revolut / N26 built-in analytics | Personal apps: no receipt attach on personal accounts. Revolut Business has receipt capture for expenses, tied to spending with the Revolut Business card ([help](https://help.revolut.com/en-FR/business/help/managing-my-business/expenses/how-do-i-attach-a-receipt-to-an-expense)) | No (personal); Revolut Business extracts basic fields, line items unclear | N/A — single-account view; no cross-account card-payment matching | Neobank analytics are category charts, not proof-of-purchase |

### B2B — spend and receipt tools

| Product | Own card required? | Receipt OCR incl. VAT / line items | Project tagging + accounting export | Notes and sources |
| --- | --- | --- | --- | --- |
| Pleo | Mostly their card; out-of-pocket reimbursements supported via "Pocket" ([pleo.io](https://www.pleo.io/en/reimbursements)) | Yes — receipt capture with suggested expense details ([help](https://help.pleo.io/en/support/solutions/articles/103000281947)) | Yes — tags/categories, Xero and other exports ([help](https://help.pleo.io/en/support/solutions/articles/103000254560)) | Card-first; existing bank accounts are not synced as spend sources |
| Spendesk | Mostly their card + reimbursements ([spendesk.com](https://www.spendesk.com/automated-expense-reporting/)) | Yes — receipt collection with OCR; VAT guidance marketed ([receipt-collection](https://www.spendesk.com/receipt-collection/)) | Yes — accounting automations and exports | Finance-team tool; not personal |
| Moss (DE) | Card-first; out-of-pocket expenses supported ([getmoss.com](https://www.getmoss.com/expense-management)) | Yes — receipt capture; GoBD-certified storage | Yes — cost centers and DATEV integration ([getmoss.com](https://www.getmoss.com/integrations/datev)) | German mid-market |
| Circula (DE) | No — works with company cards AND out-of-pocket/travel expenses ([circula.com](https://www.circula.com/en/expenses)) | Yes — OCR scanner, GoBD-compliant archiving ([blog](https://www.circula.com/de/blog/ocr-scan)) | Yes — DATEV-recommended for travel expenses, DATEV interfaces ([blog](https://www.circula.com/de/blog/datev-reisekosten)) | Strong German fit; still an employee expense-report workflow, not personal finance |
| Ramp | Yes — automation assumes you pay with a Ramp card ([ramp.com](https://ramp.com/receipt-automation)) | Yes — auto-capture, auto-generated digital receipts, itemization documented as a concept ([support](https://support.ramp.com/hc/en-us/articles/40334371635219)) | Yes — GL coding, accounting sync | US only; their card is the product |
| Brex | Yes, card-first; reimbursements for out-of-pocket exist ([brex.com](https://www.brex.com/support/expense-reimbursements)) | Yes — receipt capture and matching | Yes — accounting integrations | US/global startups |
| Expensify | No — SmartScan works on any receipt, any card, incl. cash ([use.expensify.com](https://use.expensify.com/receipt-scanning-app)) | Partial — SmartScan extracts merchant/date/amount and matches to card feeds; line-item extraction is not a headline feature ([help](https://help.expensify.com/articles/expensify-classic/expenses/Troubleshoot-SmartScan)) | Yes — reports, tags, accounting exports | Closest "any card" B2B tool; still expense reports, not a charge-by-charge personal view; SmartScan limits/fees criticized ([saaspricepulse](https://www.saaspricepulse.com/tools/expensify)) |
| Yokoy | No — handles company cards, out-of-pocket, invoices ([help](https://help.yokoy.ai/en/articles/14753-submit-an-expense-paid-with-a-company-card)) | Yes — AI OCR incl. VAT handling, digital receipts ([help](https://help.yokoy.ai/en/collections/242676-yokoy-expense)) | Yes — Xero, SAP, etc. ([help](https://help.yokoy.ai/en/articles/377790-xero-integration-for-expenses)) | Enterprise Swiss; heavy for a freelancer |
| QuickBooks receipt capture | Works with any bank feed you connect — it is your own books, not an issued card ([quickbooks.intuit.com](https://quickbooks.intuit.com/r/expenses/receipt-capture-app/)) | Partial — snaps and matches receipts; reviews note OCR limits and errors, line-item extraction unreliable ([review](https://invoicedataextraction.com/blog/quickbooks-online-receipt-capture-reviews)) | Yes — full accounting | Small-business only; nothing for personal spend; card payment appears as a transfer you must classify correctly yourself |
| DATEV ecosystem (DE) | Not a card product — digitizes receipts from your own accounts via Unternehmen online, but always through a tax advisor ([datev.de](https://www.datev.de/web/de/unternehmen/loesungen/rechnungswesen/buchfuehrung)) | Partial — stores receipt images and supports digital posting; no consumer-grade line-item OCR in the core flow ([help](https://apps.datev.de/help-center/documents/9211404)) | Yes — it IS the German accounting backend | Back-office plumbing, not a user-facing app; the export target GenieFinanz should speak to |

## Unknowns

- Whether Monarch's receipt scanning extracts line items or only merchant/date/amount.
- Exact VAT-rate breakdown quality of Expensify SmartScan and Ramp's auto-generated receipts (marketing claims only).
- Whether any B2C app anywhere does German VAT extraction from receipts — none found.
- Copilot Money's transfer/credit-card matching reliability in practice (docs describe the model, not edge cases).
- Pleo/Moss/Spendesk OCR line-item depth (item names and quantities vs. totals and VAT) — pages market "OCR" without detail.

## What this means for GenieFinanz

1. **Nobody itemizes receipts on your own cards and accounts.** B2C apps (Monarch, Simplifi, Lunch Money) store receipt photos but treat them as dead pixels. B2B tools extract data but want to issue you their card (Pleo, Moss, Ramp, Brex) or push you into expense reports (Expensify, Yokoy). GenieFinanz: line items + VAT on the cards and accounts you already have.
2. **Transfer matching is standard in B2C, absent in the receipt world** — and vice versa. Monarch/YNAB/Finanzguru stop card payments double-counting; Expensify/QuickBooks do not care because they see one side. GenieFinanz does both in one ledger.
3. **Nobody serves the person AND the business in one product.** Copilot/Monarch are personal-only; Pleo/Ramp/Circula are company-only. The freelancer buying a client lunch on their personal card falls between both — that is the opening user.
4. **German angle is open:** Finanzguru has no receipts at all; DATEV is plumbing for tax advisors, not an app. VAT-aware receipt proof (GoBD-friendly, DATEV-exportable) on personal accounts is unserved.
5. **One-line pitch:** Monarch shows you the charge; Pleo shows finance the VAT; GenieFinanz opens the charge and shows the coffee, the milk, and the tax — on the accounts you already use.
