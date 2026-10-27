# Checking the compliance guide against primary sources

Date of check: 2026-08-28. Guide checked: `research/germany-compliance-plaid.md` (GenieFinanz founder/investor brief).

## The question

Do the guide's Plaid-specific and regulatory claims (international transfers, regulated entities, retention, DPIA triggers, EU AI Act status, ZAG/BaFin perimeter) hold up against primary sources as of 28 August 2026?

## Short answer

The guide holds up. Plaid's own End User Privacy Policy confirms US AWS storage of EEA data under adequacy decisions and SCCs, names Plaid Financial Ltd. (FCA) and Plaid, B.V. (DNB, Amsterdam) as the regulated entities, and describes automatic deletion after a developer disconnects a user, subject to six exceptions. A DPIA is not automatic for this app but is strongly indicated under GDPR Art 35(3)(a) and items 5, 10 and 14 of the German DSK mandatory list. The AI Act picture changed: the AI Omnibus (in force 27 July 2026) pushed Annex III high-risk rules to 2 December 2027; transparency duties apply from 2 August 2026. The ZAG answer is genuinely "depends" — on who, in the customer's eyes, provides the consolidated account view.

## Claim-by-claim check

### 1. Plaid processes EEA data internationally, including US AWS regions, using adequacy decisions and SCCs

Verdict: supported.

Source: https://plaid.com/legal/ (End User Privacy Policy, effective 8 December 2025, "International Data Transfers" section).

Note: Plaid's exact words: "we transfer data from the EEA and UK to the United States and store data in AWS regions located in the United States… we rely on adequacy decisions, data transfer agreements… including standard contractual clauses." Plaid also says it carries out transfer impact assessments before transferring. One nuance the guide could add: Plaid's integration of Google reCAPTCHA sends data to Google in the US (covered by Google's EU-US Data Privacy Framework certification).

### 2. Which Plaid entities are regulated and where, and whether the app rides on Plaid's AISP status

Verdict: supported on entities; partly supported on "the app rides on Plaid's registration".

Sources:
- https://plaid.com/legal/ — policy names Plaid Inc., Plaid Financial Ltd. and Plaid, B.V.; footer states Plaid Financial Ltd. is "authorised by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718)".
- https://www.dnb.nl/en/public-register/information-detail/?registerCode=WFTBI (DNB register) — "Plaid, B.V., AMSTERDAM… Betaalinstelling" (payment institution), i.e. DNB-supervised.
- https://plaid.com/open-banking/ and https://plaid.com/blog/aisp/ — Plaid's own PSD2/AIS explanations.

Note: the guide's caution is right. The policy names De Nederlandsche Bank as Plaid B.V.'s regulator and confirms Plaid itself provides "regulated… account information and payment services." But whether a given app needs nothing itself is a contract and product-scope question: only the entity, countries and products in the Plaid contract are covered, and the app's own customer journey can independently trip the ZAG (see claim 6). Do not state "we are covered by Plaid's license" without checking the contracted entity and German product coverage.

### 3. What Plaid retains after a user disconnects an Item, and what deletion rights exist

Verdict: supported.

Source: https://plaid.com/legal/ ("Our Retention and Deletion Practices") plus https://my.plaid.com/data-subject-request-form and https://support-my.plaid.com/hc/en-us/articles/4410329737879.

Note: exact condition — "If a developer removes your connection from their app to your data, Plaid's systems are designed to automatically delete your personal data, subject to certain exceptions." The six exceptions: (a) another active developer connection, (b) a Plaid product the user still requests, (c) legal retention duties, (d) fraud/privacy protection, support or misuse investigation, (e) aggregation/de-identification/anonymisation, (f) explicit user agreement to longer retention. Users can also disconnect and delete via Plaid Portal (my.plaid.com) or the data-subject request form. So "verify what Plaid retains after disconnection" in the guide maps to real exceptions — worth testing with Plaid directly.

### 4. GDPR Art 35 DPIA triggers — is a DPIA likely required here?

Verdict: supported (DPIA very likely needed, but not strictly automatic on the bare facts).

Sources:
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679 — Art 35(3)(a): DPIA required for "a systematic and extensive evaluation of personal aspects… based on automated processing, including profiling, and on which decisions are based that produce legal effects… or similarly significantly affect the natural person". Financial data is not special-category data under Art 9, so Art 35(3)(b) does not bite directly.
- DSK Muss-Liste (Kurzpapier, Version 1.1, 17 Oct 2018): https://www.datenschutzkonferenz-online.de/media/ah/20181017_ah_DSK_DSFA_Muss-Liste.pdf (mirror: https://www.lda.bayern.de/media/dsfa_muss_liste_dsk_de.pdf; summary: https://www.activemind.de/magazin/dsk-blacklist-dsfa/).

Note: three DSK list items fit this app's profile: item 5 (merging personal data from several sources where this can ground decisions with legal or similarly significant effect), item 10 (merging data from different sources at large scale or with non-transparent algorithms), and item 14 ("Erstellung umfassender Profile über Bewegung und Kaufverhalten" — building extensive profiles over movement and purchasing behaviour). A bank-feed budgeting app with receipt matching builds exactly purchasing-behaviour profiles. The DSK list has strong indicative force: skipping a DPIA for a listed category "must be very well justified". Verdict: treat the DPIA as required; the guide's "assess DPIA triggers" is correct but could be firmer.

### 5. EU AI Act status as of August 2026

Verdict: the guide's direction is right; the dates need updating.

Source: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai (last update 3 August 2026) and the AI Omnibus: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202601744.

Note: current state, per the Commission: prohibited practices and AI-literacy duties apply since 2 Feb 2025; GPAI model obligations and governance since 2 Aug 2025; transparency rules (Art 50 — disclose interaction with an AI system, label AI-generated content) apply since 2 Aug 2026. The AI Omnibus (political agreement 7 May 2026, in force 27 July 2026) moved Annex III high-risk rules to 2 Dec 2027 and Annex I embedded-AI rules to 2 Aug 2028. Classification: receipt OCR plus transaction matching is minimal risk — not in Annex III (it does not decide access to essential services like credit scoring, which is listed as high-risk). If the app answers users in a chat-like flow, Art 50 transparency disclosure applies. GPAI note: obligations sit on the GPAI model provider, not on GenieFinanz as a deployer; but if GenieFinanz calls a third-party LLM it should check the provider's GPAI compliance (July 2025 Commission guidelines + GPAI Code of Practice) and honour its own deployer/transparency duties. Keep the receipt/OCR output away from anything that decides creditworthiness — that is where Annex III high-risk would start.

### 6. ZAG/BaFin perimeter for a display-only app using a regulated AISP

Verdict: partly supported — the guide's "depends on the customer journey" framing is correct; the answer is not a clean "outside BaFin".

Sources:
- https://fin-law.de/en/zag/account-information-services/ (Auffenberg, payment-services law firm): § 1 Abs. 34 ZAG defines AIS as an online service providing consolidated information on payment accounts; critically, "services where the provider is not given access to the account holder's payment account credentials, but merely passes on account data provided to it in another way… are not covered by the regulation." Pure AISPs need BaFin registration (§ 34 ZAG), not a full license.
- https://paytechlaw.com/kontoinformationsdienste-bin-ich-betroffen-bin-ich-es-nicht/ (Annerton): multi-banking apps that give "on the basis of aggregated online information… a real-time overall view of the financial situation" are in principle AISPs; the reach for adjacent services is unsettled.
- BaFin ZAG Merkblatt (Stand: Juli 2024): https://www.bafin.de/SharedDocs/Veroeffentlichungen/DE/Merkblatt/mb_111222_zag.html — BaFin's own perimeter guidance.

Note: what it depends on, concretely: (1) does GenieFinanz ever touch bank credentials (no, with Plaid Link/OAuth — good); (2) who, in the customer's eyes, provides the consolidated multi-account view — if the app itself aggregates and presents consolidated account information as its own online service, BaFin can treat the app as providing AIS under § 1 Abs. 34 ZAG even though a registered AISP (Plaid B.V.) does the bank retrieval; (3) the contractual structure — whether the user contracts with Plaid for the AIS and GenieFinanz only displays Plaid's output. The guide's recommendation (document Plaid as the connectivity layer, get a German perimeter opinion, re-review before adding payments/wallets/direct bank APIs) matches this uncertainty exactly.

## Unknowns

- Whether GenieFinanz's actual Plaid contract runs through Plaid, B.V. and covers Germany for the intended products — only the signed agreement and Plaid coverage docs can answer this.
- Whether BaFin would view the specific GenieFinanz journey as its own AIS — needs a perimeter analysis of the real screens and contracts; no public source settles a hypothetical product.
- Plaid's current public subprocessor list for the DPA — the End User Privacy Policy confirms AWS US regions and SCCs, but I did not retrieve a standalone subprocessor page in this pass; check the developer agreement/DPA before signing.
- Whether the OCR feature uses a GPAI model and which deployer duties (beyond Art 50 labelling) the Omnibus-era texts assign to it — worth a dedicated check once the OCR vendor is chosen.

## What this means for GenieFinanz

- Keep Plaid Link/OAuth and never touch credentials; the ZAG carve-out for services that never receive account credentials is the strongest perimeter protection the app has.
- In contracts and screens, position Plaid B.V. as the account-information provider and GenieFinanz as a budgeting display of Plaid's output; get a German perimeter opinion before any launch claim like "all your accounts in one app".
- Budget for a DPIA now: DSK items 5, 10 and 14 (data merging, purchasing-behaviour profiles) make it near-mandatory; document lawful bases, transfers to Plaid/AWS US (SCCs), and retention.
- In the privacy notice, name Plaid, the US AWS transfer with SCCs, and Plaid's six retention exceptions after disconnection; wire the disconnect flow to actually trigger deletion and offer export/CSV fallback.
- Label any AI chat/OCR interaction (Art 50 transparency, in force since 2 Aug 2026); keep matching output factual — no scores that could feed credit or similarly significant decisions, or Annex III high-risk territory (from Dec 2027) looms.
- Keep payment initiation, investment recommendations and credential flows behind launch gates; each one reopens BaFin/FCA perimeter questions.
