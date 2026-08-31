# Plaid in Europe, and whether we still need Tink

## The question

The README says "Plaid for US/Canada, someone like Tink for Europe." Nobody has signed a provider. This document checks whether Plaid alone can serve Germany and the EU for bank transaction data, and whether Tink is a realistic fallback for a small team. Research date: 2026-08-28.

## Short answer

Plaid works in Germany today. Its Transactions product is listed for 18 European countries including Germany, and its own coverage file (August 2026) lists 1,006 German institutions, almost all with transaction data — including Sparkasse and Volksbank/Raiffeisenbank groups. EU connections run under Plaid B.V., a Dutch payment institution supervised by DNB. The one real caveat: a personal-finance-style app that shows consolidated account data to end users may still need its own AISP registration (or an agent deal) under PSD2 — that is a legal question, not a provider question. Tink is real but sales-led: its pricing page tells new prospects to contact sales. Recommendation: go Plaid-only for the hackathon and keep Tink as a named backup, not a requirement.

## Findings

### 1. Does Plaid Transactions work with German banks? Current European coverage

- Plaid's own support article lists the following European countries as supported: Austria, Belgium, Denmark, Estonia, Finland, France, Germany, Ireland, Italy, Latvia, Lithuania, the Netherlands, Norway, Poland, Portugal, Spain, Sweden, United Kingdom. For Europe, the supported "Financial Insights" product is **Transactions**. Source: https://support.plaid.com/hc/en-us/articles/27895826947735-What-Plaid-products-are-supported-in-each-country-and-region
- Plaid claims direct connections to nearly 2,000 European financial institutions. Source: https://plaid.com/docs/institutions/europe/
- I downloaded Plaid's official EU institution coverage CSV (generated 2026-08-06): https://plaid.com/documents/eu_institution_coverage.csv (linked from the docs page above). Counting rows:
  - Germany: 1,006 institutions, of which 1,004 have the "data" (account/transactions) product enabled. Germany is Plaid's largest EU market by institution count in this file.
  - The file includes 601 Volksbanken Raiffeisenbanken entries, 355 Sparkasse entries, and 15 Sparda-Bank entries. So the cooperative and savings-bank groups — the usual German coverage worry — are present.
  - Other country counts: IT 222, FR 94, GB 79, ES 68, DK 33, PT 22, NL 15, BE 15, PL 12, IE 10, SE 9, NO 7, AT 7, LV/LT/EE 6 each, FI 2, CZ 2, CH 2.
  - Caveat: the page warns the CSV is updated roughly quarterly and says to use the `/institutions/get` API or Dashboard for current data. These counts are from my own parsing of the CSV (verified by me, not by Plaid's marketing copy).
- Inference: one blog post (July 2026) claims Plaid "barely covers German banks" (https://blog.wimm.my/finance-apps-for-germany-when-plaid-doesnt-reach-your-bank/). Plaid's own current CSV contradicts that for institution count. The blog may reflect connection quality issues rather than coverage. Flagged as conflicting evidence; institution count alone does not prove connection reliability.

### 2. Legal entity, PSD2 permission, and who needs an AISP registration

- The EEA entity is **Plaid, B.V.**, Muiderstraat 1, 1011PZ Amsterdam, listed in De Nederlandsche Bank's register as a "Betaalinstelling" (payment institution), register entry R179714. Source: https://www.dnb.nl/en/public-register/information-detail/?registerCode=WFTBI& (search result for "Plaid, B.V., AMSTERDAM"). Plaid's own legal page confirms Plaid B.V. is the entity responsible for EEA end users and that it answers to DNB. Source: https://plaid.com/legal/ ("Contacting Plaid" and "Lawful bases" sections).
- UK entity: Plaid Financial Ltd., FCA-authorised, FRN 804718, for AIS and PIS. Source: https://register.fca.org.uk/s/firm?id=0010X000049JuDPQA0 (referenced from https://plaid.com/en-eu/open-banking/).
- Who needs their own AISP registration: Plaid's guidance (FCA-based) says a business that "provides consolidated account information" to end users — e.g. a personal finance management tool — will **generally need to be registered or authorised for AIS itself**, while internal use cases (fraud, credit decisioning) generally will not. Sources: https://plaid.com/en-eu/open-banking/ and https://plaid.com/blog/aisp/
  - This matters directly: GenieFinanz shows consolidated transactions to users, so it sits in the "generally needs registration" bucket. (Inference from Plaid's own guidance; final call needs legal counsel.)
- Alternative to own registration: become an **agent of Plaid** — Plaid registers you with the regulator (the page describes the FCA process; the EEA/DNB path is not spelled out on the public page). Source: https://plaid.com/en-eu/open-banking/ ("alternatives to AIS registration").
- Germany-specific caveats:
  - German banks expose PSD2 XS2A APIs; the old finTS/HBCI protocol is a separate legacy rail. Open-source adapters treat them as distinct. Source: https://github.com/adorsys/open-banking-gateway (description of connectors "for banks that support PSD2 and XS2A as well as HBCI/FinTS").
  - Sparkasse/Volksbank coverage in Plaid exists per the CSV (above), but XS2A implementations at German savings banks are known across the industry for friction (frequent re-consent, app-based SCA). I could not verify Plaid-specific German connection quality from an official source — see Unknowns.
  - PSD2 re-consent: EU AIS connections require reauthentication; Plaid extended consent to 180 days after the EBA rule change. Source: https://plaid.com/blog/eu-reauth-update/

### 3. Production access for a small team

- Free Sandbox for development. Source: https://support.plaid.com/hc/en-us/articles/16194695660311-Can-I-use-Plaid-for-free and https://plaid.com/docs/sandbox/
- **Trial plan**: free Production access for up to 10 Items with a streamlined approval questionnaire (introduced 2025 per the Plaid changelog, July 2026 snapshot). Full Production requires the standard application/verification. Sources: https://plaid.com/docs/changelog/ and https://support.plaid.com/hc/en-us/articles/16110110883479-How-are-Sandbox-Production-Trial-plan-and-Limited-Production-different
- Signup is self-serve via the Dashboard; API keys in minutes; production approval involves a company questionnaire. Sources: changelog/support articles above.
- Pricing model: I did not re-fetch plaid.com/pricing this session; Plaid publicly prices per-product (per-connected-account / per-call) with pay-as-you-go tiers. Exact EU Transactions pricing: see Unknowns.

### 4. Where EEA data is processed, and transfer mechanisms

- Plaid's End User Privacy Policy (effective December 8, 2025): "we transfer data from the EEA and UK to the United States and store data in AWS regions located in the United States." Transfers rely on adequacy decisions, **standard contractual clauses**, and other approved mechanisms; Plaid says it performs transfer impact assessments with supplementary measures. Source: https://plaid.com/legal/ ("International Data Transfers" section).
- Plaid B.V. (Amsterdam) is the responsible entity for EEA end users, with a DPO reachable at privacy@plaid.com. Source: https://plaid.com/legal/ ("Contacting Plaid").
- Meaning: EEA data is processed/stored in the US under SCCs. That is lawful but is a data-residency fact German business customers may ask about. (Inference: this is a sales/DDPA consideration, not a blocker.)

### 5. Tink (Visa): coverage, shape, friction

- Tink is owned by Visa (acquisition completed March 2022). Source: https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18881.html
- Coverage: 3,400+ banks across 18 European markets; Germany is a first-class market (Tink has a Deutschland site). Source: https://tink.com/account-aggregation/
- Product shape: aggregation API + Tink Link SDK; Transactions product; background refresh up to 4x/day. Source: https://tink.com/account-aggregation/
- License model: if you aggregate and present account data you "typically need a PSD2 licence"; Tink offers an **agent model under Tink's licence**. Source: https://tink.com/account-aggregation/
- Signup: self-serve console signup exists (https://console.tink.com/signup), and there is a "Standard" tier using Tink's licence — but the pricing page (checked 2026-08-28) says listed prices apply only to existing customers and **new prospects must contact sales** for pricing. Business Transactions, the product a small-business bookkeeping app would want, is **Enterprise-only**. Source: https://tink.com/pricing/
- Verdict on Tink: not enterprise-only in theory (console signup + Standard tier exist), but sales-led pricing and Enterprise gating of Business Transactions make it higher-friction than Plaid for a hackathon team. Realistic fallback, not a better primary.

### 6. Alternatives for Germany (one paragraph each)

- **finAPI** (Munich): BaFin-licensed German provider; Banking API with PSD2 XS2A access, plus finTS-flavoured coverage historically; offers a 30-day free trial. Strong Germany focus, German-language contracts and support. Sources: https://www.finapi.io/en/home/ and https://www.finapi.io/en/products/open-banking/banking-api/
- **TrueLayer**: UK/EU open banking provider with data and payments APIs across much of Europe, self-serve console and free sandbox. Germany coverage exists but TrueLayer's centre of gravity is the UK. Source: https://www.openbankingtracker.com/open-banking-apis-europe (comparison listing; not verified on truelayer.com this session — see Unknowns).
- **GoCardless Bank Account Data** (formerly Nordigen): well-documented AIS API with a generous free tier historically — but as of 2025, new self-serve signups appear to be closed/redirected to sales. Sources: https://developer.gocardless.com/bank-account-data/overview and user reports: https://www.reddit.com/r/selfhosted/comments/1mfs6ro/actual_budget_cannot_sign_up_to_gocardless/ plus https://www.openbankingtracker.com/guides/free-open-banking-apis ("no longer an option for new projects").
- **Enable Banking**: Finnish aggregator, self-serve signup, transparent pay-per-request pricing, broad PSD2 API coverage including German banks; popular with indie devs as a Nordigen replacement. Source: https://www.openbankingtracker.com/guides/free-open-banking-apis (not verified on enablebanking.com this session — see Unknowns).

### 7. Verdict

- Plaid alone covers US/Canada plus Germany and 17 other European countries for the Transactions product, under one API and one dashboard. The README's "someone like Tink for Europe" line is out of date.
- The real open item is regulatory, not technical: GenieFinanz likely needs either its own AISP registration or an agent arrangement (Plaid's agent path is documented for the UK; EEA agent path unclear) because it presents consolidated account data to end users. This applies equally to Tink and every alternative — switching providers does not remove it.
- Recommendation: **go Plaid-only** for US/Canada + Germany/EU at hackathon stage. Keep Tink (or Enable Banking) as a named fallback in case German connection quality disappoints in testing.

## Unknowns

- Live connection quality and success rates at specific German banks (Sparkasse/Volksbank XS2A). The CSV proves coverage listings, not reliability. Only a Plaid Trial-plan test settles this.
- Whether Plaid offers its agent model under Plaid B.V. in the EEA (the public page describes the FCA process only).
- Exact current Plaid EU Transactions pricing (plaid.com/pricing not re-fetched this session).
- Whether BaFin takes a stricter view than the FCA on when a German-facing app needs its own AISP registration. Legal counsel question.
- TrueLayer and Enable Banking details (coverage lists, current pricing, signup terms) were taken from third-party comparison pages, not their own sites.
- Whether Plaid's German coverage includes business accounts (the CSV has a business flag; I did not break it down per country).

## What this means for GenieFinanz

- Plan for one provider: **Plaid for US, Canada, Germany, and the rest of supported Europe**. One SDK, one webhook model, one reconciliation pipeline.
- Proposed README line change: replace "Plaid for US/Canada, someone like Tink for Europe" with **"Plaid for US/Canada and Europe (incl. Germany); Tink or Enable Banking as fallback if German bank connections underperform."**
- Sign up for a Plaid account, build on the free Sandbox, and request the **Trial plan** (free Production, up to 10 Items) to test real German banks before any paid commitment.
- In testing, prioritise Sparkasse, Volksbank/Raiffeisenbank, Deutsche Bank, N26, and ING Germany — these cover most German users and are where XS2A friction would show.
- Get legal advice early on the **AISP question**: GenieFinanz shows consolidated account data, which per Plaid's own guidance "generally" requires registration; ask Plaid sales about its agent model for EEA customers in the same conversation.
- For German business customers, note in the security page that Plaid processes EEA data in US AWS regions under standard contractual clauses, with Plaid B.V. (Amsterdam, DNB-supervised) as the responsible entity.
