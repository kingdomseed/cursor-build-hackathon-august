# GenieFinanz

Receipt-to-transaction prototype: log in, open a Commerzbank account, inspect
transactions and their receipt line items, then upload or scan a receipt with OCR.

Pages and API routes live in one Next.js app so it can deploy on Vercel.

## Run locally

```bash
npm install
npm run dev
```

App: http://localhost:3000

## Demo login

- Email: `demo@geniefinanz.de`
- Password: `genie1234`

## Deploy on Vercel

Import this repository. Vercel should detect Next.js at the project root.
No separate frontend/backend projects are needed.

## Notes

- Dummy data lives in `data/transactions.json` (no database).
- OCR runs `tesseract.js` in the browser. The first scan downloads German traineddata, then reuses the worker.
- Scanned items are written back via `PATCH /api/transactions/:id`.
