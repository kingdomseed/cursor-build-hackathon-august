# Create Solution

## C1 — Construct a logical plan

Approved by the human via the FinanzGuru Prototype Plan. Tickets in order:

1. scaffold-backend
2. create-json
3. backend-routes
4. scaffold-frontend
5. login-page
6. dashboard-page
7. transactions-page
8. transaction-detail
9. receipt-scanner

## C2 — Demonstrate technical skills

| Ticket | Skills | Evidence |
| --- | --- | --- |
| scaffold-backend | Next.js App Router API app, TypeScript, CORS | `backend/` compiles; `next dev -p 3001` Ready |
| create-json | JSON file store, German dummy receipt data | `backend/data/transactions.json` — 1 Commerzbank account, 8 transactions |
| backend-routes | Auth cookie/Bearer, REST, tesseract.js OCR, native FormData | Login 200; unauth 401; accounts=1; 8 transactions; PATCH persist |
| scaffold-frontend | Next.js App Router, Tailwind | `frontend/` compiles on port 3000 |
| login-page | Client form, token in localStorage + cookie | `GET /` 200 |
| dashboard-page | Auth gate, account card | `GET /dashboard` 200 |
| transactions-page | List + category chips | `GET /accounts/acc-commerzbank-001` 200 |
| transaction-detail | Item table mapped to a transaction | `GET /.../transactions/tx-001` 200; REWE 5 items |
| receipt-scanner | File upload, getUserMedia camera, OCR API, save | `ReceiptScanner` on the detail page |

## C3 — Follow the plan to create the solution

All nine tickets implemented. Verification:

- `cd backend && npm install && npm run dev` → http://localhost:3001 Ready
- `cd frontend && npm install && npm run dev` → http://localhost:3000 Ready
- POST `/api/auth/login` with demo credentials → 200
- POST login with wrong password → 401
- GET `/api/accounts` without token → 401
- GET `/api/accounts` with token → Commerzbank
- GET `/api/transactions?accountId=acc-commerzbank-001` → 8 transactions
- GET `/api/transactions/tx-001` → REWE, 5 items
- PATCH `/api/transactions/tx-001` → items persist, then dummy data restored
- Frontend routes `/`, `/dashboard`, `/accounts/[id]`, transaction detail → 200

## C4 — Justify changes to the design

- **Upload parser:** App Router `request.formData()` instead of `formidable`. Same contract (multipart image → OCR), fewer dependencies, native to Next.js 14.
- **Auth transport:** Token is set as a cookie and also returned in the JSON body. Frontend sends `Authorization: Bearer` on API calls so cross-origin localhost (3000 → 3001) stays reliable.
- **PATCH `/api/transactions/[id]`:** Added so scanned items can be saved back to `transactions.json`, as required by the receipt-scanner ticket.
- **Receipt upload only when items are missing:** The scanner is hidden on transactions that already have line items. A new Lidl transaction (`tx-009`) has an empty `items` list so the user is asked for a receipt image only there.
- **Demo session reset:** OCR still saves items during a session. Transactions flagged `resetOnSession` (Lidl) are cleared on login and logout so the receipt scan can be shown again.
- **Home tabs:** The dashboard opens on Spending (totals by category, drill-down to top items) with Accounts as the second tab. Dummy data includes Deutschland-Ticket and Rindfleisch so Transport and Groceries have clear top items. Item lists use receipt line items only (no supermarket names). A hardcoded monthly budget of €400 shows spent vs remaining.
- **Single Next.js app:** UI and API routes live in one project at the repository root so Vercel can deploy them together. Client calls use same-origin `/api/*`.
