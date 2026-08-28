# Germany Personal Finance App Compliance Guide

Founder & Investor Brief | Plaid Integration | August 2026

## GDPR

Requirement: Personal and financial data require a lawful basis, transparent purposes, minimisation, retention limits, security and enforceable user rights. A DPIA is needed where processing is likely to create high risk.

Recommended Solution: Map app-Plaid-bank data flows; document lawful bases and product-specific controller/processor roles; request only necessary Plaid products and data; disclose Plaid; support access, deletion and disconnection; and assess DPIA and DPO triggers.

## PSD2

Requirement: Plaid may provide the regulated account-information connection for EEA users, but only for the entity, products and countries covered by your contract. The app's own design and claims still determine its regulatory perimeter.

Recommended Solution: Use Plaid Link and OAuth; never collect bank credentials; confirm German production coverage, the contracted entity and enabled data products; record user consent; handle consent-expiry webhooks; and keep payment initiation disabled unless separately approved.

## German Payment Services Supervision Act (ZAG)

Requirement: Using a regulated connectivity provider does not automatically remove ZAG risk. BaFin considers the contracts, customer journey and whether the app independently provides account information, initiates payments or holds funds.

Recommended Solution: Document Plaid as the connectivity layer and the app as the budgeting interface; obtain a German perimeter opinion; do not initiate payments or bypass Plaid; and repeat the review before adding Payments Europe, wallets or direct bank APIs.

## Financial Services Regulation

Requirement: Personalised recommendations on financial instruments, order transmission, execution or discretionary portfolio management may trigger BaFin authorisation and conduct obligations.

Recommended Solution: Limit outputs to factual spending, budgeting and cash-flow insights. Exclude buy/sell calls, product rankings presented as suitable, trade execution and custody. Put every investment-facing feature behind a legal launch gate.

## AI Compliance

Requirement: The EU AI Act and GDPR require role/risk classification, transparency and governance. Automated decisions with legal or similarly significant effects need particular scrutiny.

Recommended Solution: Label AI interactions; explain inputs, limitations and confidence; provide human escalation; test and log model changes; prohibit investment advice; train staff in AI literacy; and do not reuse customer data for training by default.

## Cybersecurity

Requirement: GDPR requires security appropriate to risk and a breach-response process. PSD2, DORA or sector controls may apply if the company becomes regulated or serves regulated institutions.

Recommended Solution: Encrypt data and Plaid access tokens; keep Plaid secrets server-side; enforce MFA, least privilege, patching, monitoring and tested backups; verify webhooks; avoid logging tokens or raw financial data; penetration-test the integration; and maintain a 72-hour GDPR assessment.

## Cloud & International Data Transfers

Requirement: Plaid states that EEA data may be processed internationally, including in US AWS regions, using mechanisms such as adequacy decisions and SCCs. The app must still assess and disclose its own transfers and onward processing.

Recommended Solution: Review Plaid's contract, privacy terms, transfer safeguards, retention and subprocessors; add Plaid to the privacy notice and DPIA; minimise stored API output; encrypt tokens; implement revocation and deletion; and verify what Plaid retains after disconnection.

## Third-Party Service Providers

Requirement: Plaid is a material bank-data vendor, while the company remains responsible for its own use of Plaid output, security, user disclosures, availability planning and any additional processors.

Recommended Solution: Complete Plaid legal, privacy, security and resilience due diligence; assign an owner; monitor incidents and coverage; map support and breach escalation; require deletion and exit terms; and retain CSV/manual import as a user-controlled fallback.

## Legal Documentation

Requirement: Users need clear privacy, consumer and contractual information. Germany may require an Impressum, subscription disclosures and valid cookie/marketing consent depending on the service design.

Recommended Solution: Before beta, publish privacy, terms, Impressum and consent notices that name Plaid and explain requested data, purposes, transfers, retention, disconnection and rights. Maintain Plaid contracts, a vendor register, retention schedule and matching German/English disclosures.

## Product Design Principle

Requirement: Regulatory exposure follows the actual user journey, data flows and claims - not the product label. Dark patterns and unnecessary collection undermine valid choice and investor confidence.

Recommended Solution: Adopt a read-only, user-controlled design: use Plaid Link/OAuth, request only the data needed for budgeting, show a clear connect/disconnect flow, refresh expiring consent, support export/delete, offer CSV fallback and keep payments behind a separate launch gate.

## Compliance Strategy Recommendation

Primary references: GDPR | PSD2 | AI Act | BaFin | Plaid Legal | Plaid OAuth | Plaid Policy
