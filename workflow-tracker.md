# Workflow Tracker

`workflow-tracker.md` is the short, always-current position record for one
Structured Workflow cycle. Update it before workflow work and whenever the work
moves to another criterion or phase. Keep findings in the phase documents.

---

## Current position

- **Phase:** A — Inquire and Analyze
- **Criterion:** A1 — Explain and justify the need
- **Current question:** What does "implement plaid-openapi with the backend" mean for BelegGuru?
- **Active document:** inquiry.md
- **Artifact or version:** A1 draft written; awaiting human confirmation
- **Active ticket:** none
- **Target artifact:** an approved Design Brief for cursor-build-hackathon-august

## Linked context

- **Upstream evidence:** https://github.com/kingdomseed/structured-workflow @ 013a919
- **Criteria source:** not written yet
- **Downstream destination:** not chosen yet
- **Glossary:** GLOSSARY.md

## Movement

- **Likely next move:** A2 — Identify and prioritize research, after A1 is confirmed
- **Why:** the schema is too large to implement blindly; research should cover which Plaid products map to accounts, IBAN, and transactions
- **Expected result:** a short research list and answers that can support a Design Brief
- **Return destination:** A1 — Explain and justify the need until the human confirms
- **Open blocking decisions:** which account of the need (BelegGuru data source vs full Plaid re-host); sandbox vs production; JSON fallback

## Notes

BelegGuru already exists: Next.js frontend (port 3000) and backend (port 3001) with demo login, JSON accounts/transactions, and receipt OCR. `schemas/plaid-openapi.yml` is Plaid API 2020-09-14_1.729.1. Phase templates from upstream were missing; `inquiry.md` was created as the Criterion A record.
