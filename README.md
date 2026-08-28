# Where the money goes

Sync transactions from more than one account. Then show where the money went.

You do that by attaching the proof. Receipts. Invoices. Anything else that breaks a charge into what you actually bought.

## Why this exists

A checking account will show one payment to a credit card. That number does not tell you what you bought. The card has the store names. The receipt has the line items. This app keeps those next to each other.

I do not want another budget app. I want to open a charge and see the coffee, the milk, the tax.

## What it does

It pulls transactions from the accounts you connect and keeps pulling as new ones land. You attach a photo or a file to a charge. The app shows the charge and the itemized list together.

That is the whole product.

## What you connect

Bank accounts and cards first. Investments and loans can wait.

North America and Europe. I dropped India. That was extra.

Plaid is the first way I would pull US and Canada data. In Europe I would use someone like Tink so I am not talking to each bank myself. I have not signed anyone.

This hackathon build is Next.js, front and back in one repo.

## Who is building it

Six people.

- Ahmed, product
- Osama, backend
- Salman, frontend
- Wentan, compliance
- Jason, data and setup
- Nikhil, vision

## What Plaid actually gives you

Plaid is a contract and a pipe. It is not the product.

You send a person through Link. That creates one Item, which is one login at one bank. The Item has accounts. You call `/transactions/sync` and get added, changed, and removed transactions. Each transaction belongs to one account.

A positive amount means money left that account. A debit buy is positive. A refund or a payment hitting the card is negative.

Plaid will not attach your receipt. Plaid will not match the checking payment to the card payment. That matching is ours, so we do not treat the card payment as spend.

```mermaid
flowchart TB
  subgraph plaid [Plaid]
    Link[Link]
    Item[Item, one login]
    Acc[Account]
    Txn[Transaction]
    Sync["/transactions/sync"]
  end

  User([User]) --> Link
  Link --> Item
  Item --> Acc
  Acc --> Txn
  Item --> Sync
  Sync --> Txn

  subgraph app [This app]
    Charge[A charge]
    Proof[Receipt, invoice, or other itemized proof]
  end

  Txn --> Charge
  Charge --> Proof
```

The OpenAPI file is the contract. A copy lives at `schemas/plaid-openapi.yml`. You still need a Plaid app, Link, and an access token before anything comes back.

## GenieFinanz: Not a simple Finance Dashboard

### Friday Afternoon at 4:45 PM

Sarah, the Head of Finance at a fast-growing company, looks at a spreadsheet with 200 unmatched bank transactions. It is the end of the month, and she is playing her least favorite game: Financial Detective.

She sighs and sends her third company-wide Slack message of the week: “Who spent €249 at Apple on Tuesday? And please, I need the receipt.”

Meanwhile, across town, an account executive named Alex ignores the message because he is frantically searching his email inbox for a PDF invoice from a vendor who is threatening to pause their software service.

This is the hidden tax on growing businesses: hours wasted on missing paperwork, broken spreadsheets, and manual data entry.

### Monday Morning: Enter GenieFinanz

The company connects its bank accounts and corporate cards to GenieFinanz. The friction immediately disappears.

#### The Employee’s Story

Alex takes a client out for lunch. Before he even leaves the restaurant, he snaps a quick photo of the receipt on his phone. GenieFinanz AI reads the image, identifies the merchant, extracts the VAT, and instantly matches it to the pending charge on his corporate card. No expense reports to fill out. Alex is done in five seconds.

#### The Vendor’s Story

An invoice from a cloud provider arrives in the company finance email inbox. GenieFinanz automatically pulls the PDF, extracts the line items, and checks it against the original contract terms. It notices a €50 overcharge based on their negotiated rates, flags it in the “Needs Attention” inbox, and queues the correct amount for approval.

#### The Finance Leader’s Story

Sarah opens the dashboard on Friday afternoon. Instead of a messy spreadsheet, she sees a clean screen: “All accounts reconciled. 98% of transactions have receipts. 2 items need your attention.” With two clicks, she approves the flagged items. The system automatically pushes the perfectly categorized data straight into QuickBooks.

### Beyond the Basics: Solving the Bigger Business Problems

As the company scales, GenieFinanz quietly solves deeper financial headaches:

- **The Ghost Subscriptions:** The system reviews recurring payments and alerts Sarah that they are paying for 15 unused software licenses across three different departments, saving the company €1,200 a month.
- **The International Tax Trap:** During an overseas business trip, the AI automatically isolates the foreign VAT paid on hotels and meals, organizing it into a clean export so the company can easily claim thousands of euros back from foreign governments.
- **Project Control:** The engineering team starts a new client project. Every time a developer purchases a cloud server or a testing tool, GenieFinanz automatically tags the expense to that specific client project, showing the actual profit margins in real time.

Sarah closes her laptop at 5:00 PM. The books are closed, the compliance trail is airtight, and the team can focus on growth instead of paperwork.

## Status

Hackathon. First note on 17 Aug 2026. This write-up on 28 Aug 2026. Repo exists. App is not built yet.
