# CareCova Credit Platform — Rebuild Plan

**Last updated:** 2026-08-03  
**Status:** Planning — not yet in implementation

---

## The Problem We Are Solving

The platform has all the right pieces — Mono, Gemini, P2Vest, a full application flow — but they don't tell a coherent story. An admin opens an application and sees a wall of cards with no clear sense of what to do next or why. The customer sees "pending admin review" regardless of what stage their application is actually at. The credit analysis relied on Mono premium endpoints that were expensive and have now been replaced with a smarter, cheaper approach.

The rebuild is not starting from scratch. It is reorganising what already exists, wiring in the new Mono + Gemini approach, building a provider abstraction so P2Vest is just the first of many lenders, and expanding the borrower types the platform can serve beyond healthcare individuals.

---

## Cost Control Principle — Manual Triggers Only

**Every API call that costs money must be manually triggered by an admin reviewer. Nothing runs automatically.**

This means:
- Gemini AI analysis does NOT run on form submission
- BVN lookup does NOT run automatically when an admin claims an application
- Transaction fetch does NOT fire automatically when Mono Connect webhook confirms a link
- Credit analysis does NOT run automatically after transactions are fetched
- Provider submission does NOT happen without explicit admin confirmation

The only things that happen automatically are free: saving the application to the database, sending a basic confirmation notification to the applicant, and recording the Mono webhook event.

An admin must decide to spend each API call. This prevents random applicants from burning credits and keeps cost per application predictable and controlled.

---

## Infrastructure — Keys to Update First

Before any phase begins, update the backend with the active Mono keys.

In `Care-cova-api/.env`:
- `MONO_SECRET_KEY` → `live_sk_nyusxoxn5kq097v3qbmw`
- `MONO_SECRETE` → `live_sk_nyusxoxn5kq097v3qbmw`
- `MONO_PUBLIC_KEY` → `live_pk_zgfwbfudx9xbkp0qs2zh`
- `MONO_WEBHOOK_SECRET` → keep existing value

Same update on Render/Azure environment variables — the deployed API is still using the expired key.

The Lookup app key (`live_sk_nyusxoxn5kq097v3qbmw`) now covers both Connect and Lookup. The original Connect key (`live_sk_qyfahd6zx6ghocwxe0k3`) is expired and should not be used.

---

## Borrower Types — Expanding Beyond Healthcare

The platform currently serves one borrower type: individuals borrowing to pay for healthcare at a hospital. It will expand to support business loans and other types in future. The priority and sequencing is:

**Phase 1–6: Healthcare Individual only.** The existing form and flow, improved and rebuilt properly. Nothing changes about the current application form.

**Phase 7 (last, after everything else is stable): Business Loan.** A completely separate form — its own page, its own route, its own component. It does not touch the healthcare form in any way. The existing application flow is never modified for business loan support.

**Future: Personal Loan and others.** Same pattern — separate form per loan type, plugs into the same review infrastructure and provider registry.

This sequencing ensures the business loan feature cannot break or complicate the healthcare flow during development. The two forms share the backend schema and review infrastructure but are entirely independent on the frontend.

---

## Phase 1 — Fix What Is Broken (3 days)

### Customer Portal — Status Display

Every application currently shows "pending admin review" because the frontend is not mapping status codes to human-readable labels. Add a single status-to-label map used consistently across the customer portal:

- SUBMITTED → "Application received"
- PENDING → "Under initial review"
- PENDING_STAGE1 → "Sales team reviewing"
- PENDING_ADMIN_REVIEW → "Credit team reviewing"
- INCOMPLETE → "Action required — check your email"
- APPROVED → "Approved — awaiting disbursement"
- APPROVED_FOR_DISBURSEMENT → "Being processed"
- ACTIVE → "Loan active"
- COMPLETED → "Loan completed"
- SALES_REJECTED / ADMIN_REJECTED / REJECTED → "Not approved at this time"

Also add a visual status stepper on the customer loan detail page so the applicant can see which stage they are at, not just a text label.

### Admin ApplicationDetail — Declutter

The current page stacks too many cards with no hierarchy. Rebuild it around the guided stage timeline (see Phase 5). Each stage is a clearly labelled section. The admin sees exactly what stage the application is at and what action is needed next.

The DirectDebitCard is hidden from the UI for now — the code is preserved but not rendered. Direct debit is suspended, not removed. It can be reactivated by restoring the component when needed.

---

## Phase 2 — Rewire Mono (4 days)

### What Mono Gives Us (Basic Plan — ₦50,000/month)

- Bank account linking via Mono widget
- Full transaction history
- Bank statement
- Account info (name, number, bank)

We do NOT use Mono's premium analysis endpoints (income records, assets, creditworthiness, inflows, credits, debits). We fetch raw transactions and run our own analysis.

### Mono Connect Flow — Replace Email Link with Better UX

Currently, the admin sends a Mono link to the customer's email. The customer opens their email, clicks the link, completes bank linking, and someone manually checks if it worked. This has high drop-off and no real-time feedback.

New flow: admin clicks "Send bank link" from the review page. The customer receives an email with a clean branded page that opens the Mono widget. When the customer completes it, the Mono webhook fires and the application status updates automatically. The admin's review page shows "Bank linked ✓" without manual refreshing.

### Direct Debit — Suspended, Not Removed

The direct debit code (backend service methods, routes, schema fields) is kept intact and untouched. The DirectDebitCard component remains in the codebase but is not rendered in the current UI. When direct debit is needed again in future, it is reactivated — not rebuilt.

### Transaction Fetch — Manual Trigger

When the Mono webhook confirms an account is linked, the system records the `monoAccountId` on the application — that is all. No API calls are made automatically.

The admin then sees "Bank account linked" on the review page with a button: **"Fetch bank statement."** Clicking it:
1. Calls `/v2/accounts/{monoAccountId}/transactions` for the last 6 months
2. Calls `/v2/accounts/{monoAccountId}/statement` for the PDF record
3. Stores both on the loan application
4. Shows the admin a confirmation: "Statement fetched — 183 transactions retrieved"

The fetch button is only shown once the account is linked and is greyed out after data has been fetched (re-fetch requires a deliberate override action).

---

## Phase 3 — Transaction Analysis Engine (5 days)

This replaces everything that Mono's premium plans used to do. We own the analysis.

The engine uses a **hybrid two-layer approach**: a deterministic rule-based classifier runs first and handles all predictable, common patterns at zero AI cost. Gemini only processes what the rule engine could not confidently classify, plus it always generates the final credit narrative. This keeps results consistent and auditable for known patterns while letting AI handle complexity.

### Layer 1 — Rule-Based Classifier (Runs First, Always Free)

The rule engine processes every transaction before Gemini is involved. It uses deterministic string matching and pattern detection, produces a `confidence` flag of HIGH for every match, and tags each transaction with a category and source. Transactions it classifies with HIGH confidence are not sent to Gemini at all.

**Known Nigerian lender detection**

A maintained list of lender name patterns matched against transaction narrations. Any debit whose narration contains one of these strings is immediately classified as a loan repayment with the lender identified.

Lender patterns to maintain: Carbon, OneFi, FairMoney, Branch, Renmoney, PalmCredit, QuickCheck, Aella, CredPal, CDCare, Moniepoint, Okash, Lidya, KiaKia, Kuda Loan, Opay Loan, Paylater. This list is a configuration — adding a new lender requires one line, not a code change.

**Recurring salary detection**

A credit is flagged as a likely salary payment when: it comes from the same narration source at least twice, the amounts are within 15% of each other, and the credits fall in the same week of the month (±5 days) across multiple months. No AI needed for a consistent ₦350,000 credit appearing on the 25th every month labelled "PAYROLL DANGOTE GROUP."

**Known utility and bill detection**

Debits whose narrations match known Nigerian utility and service providers are categorised immediately. Patterns to maintain: PHCN, EKEDC, IKEDC, AEDC, BEDC, PHEDC, KEDCO (electricity), DSTV, GOtv, Startimes (cable), Airtel, MTN, Glo, 9mobile (airtime/data), Lagos Water, Abuja Water. Rent is harder to detect deterministically — left for Gemini.

**Outcome of Layer 1**

After the rule engine runs, every transaction is either tagged with HIGH confidence classification or marked as UNCLASSIFIED. A typical 6-month statement of 200 transactions might see 140 classified by rules (loan repayments, salary, utilities, airtime) and 60 sent to Gemini. This directly reduces Gemini token usage and cost.

### Layer 2 — Gemini Classifier (Runs on Unclassified Transactions Only)

Gemini receives only the transactions the rule engine could not classify. Its job is to interpret ambiguous narrations — transfers whose purpose is unclear, lumpy credits that might be freelance income or business revenue, POS debits that could be anything, and unusual patterns the rules cannot anticipate.

Gemini returns classifications for the remaining transactions, and it always generates the credit narrative regardless.

For business loans, Gemini additionally analyses the full classified picture to identify: POS settlement patterns (business revenue), bulk outgoing transfers (supplier payments), and seasonal revenue behaviour.

**Red flag detection** is shared across both layers. The rule engine flags mechanical patterns (e.g. loan taken out within 3 days of repayment = debt cycling). Gemini flags qualitative patterns (e.g. salary credited but account shows no regular expenses — suggests this may not be the primary account).

### Step 3 — Merge and Compute Credit Profile

After both layers complete, merge the results and compute the credit profile stored on the loan application:

- **Monthly income** — 6-month average of all identified income streams (salary + business revenue + other)
- **Income stability score** — coefficient of variation across monthly income figures (`calculateIncomeStabilityFromSeries()` already implemented)
- **Active debt obligations** — sum of identified monthly loan repayments (rule-detected + Gemini-detected)
- **Debt-to-income ratio** — obligations divided by income
- **Net disposable income** — income minus rule-categorised expenses minus debt obligations
- **Estimated monthly repayment** for this loan — requested amount divided by tenor
- **New repayment-to-income ratio** — Rule A check (≤30% of income)
- **Total debt load ratio** — Rule B check (≤40% of income including existing debt)
- **Internal credit score** — `calculateInternalCreditScore()` (300–850 scale)

Each classification in the stored result records its source: `rule_engine` or `gemini`. This makes the output fully auditable — a reviewer can see exactly why each transaction was categorised the way it was and which layer made the call.

### Step 4 — Analysis UI

Replace the current `InformedDecision.jsx` page with a clean breakdown: Income, Debt, Cash Flow, Red Flags, Credit Score. Each detected item shows its source (rule or AI) so reviewers can trust deterministic findings and give appropriate weight to AI-inferred ones. The Gemini credit narrative appears at the bottom — plain English, one paragraph, actionable recommendation.

### Maintaining the Rule Engine Over Time

The rule-based classifier improves as the platform learns. When an admin notices a lender being missed or a pattern consistently misclassified, they add one entry to the config. Over time the proportion of transactions needing Gemini shrinks, Gemini costs fall, and classification consistency improves. This is intentional — the rule engine is designed to grow.

### BVN Verification — Manual Trigger

Stage 1 of the review timeline shows a **"Verify BVN"** button. Clicking it calls Mono Lookup (`POST /v2/lookup/bvn`) with the BVN from the application. The result — verified name, and match status against the applicant's stated name — is shown inline. Cost: ₦45/call.

For business loans, Stage 1 additionally offers a **"Verify CAC"** button (₦64/call) which confirms the business registration number and returns the registered business name for cross-checking against the application.

If BVN verification fails, the reviewer sees the reason and can make a judgment call before proceeding.

---

## Phase 4 — Multi-Provider Lending Framework (4 days)

P2Vest is wired directly into the codebase everywhere. The goal is to make "submit to a lender" a generic action. P2Vest becomes one implementation of a standard interface.

### Provider Interface (Backend)

Define a `LendingProvider` interface:

```typescript
interface LendingProvider {
  id: string
  name: string
  supportedLoanTypes: LoanType[]
  minLoanAmount: number
  maxLoanAmount: number
  canHandle(application: LoanApplication): boolean
  submitCreditReview(application: LoanApplication): Promise<CreditDecision>
  acceptOffer(application: LoanApplication): Promise<LoanAcceptance>
  getRepaymentAccount(application: LoanApplication): Promise<RepaymentAccount>
}
```

`canHandle()` encodes the provider's rules. P2Vest requires minimum ₦500,000, a BVN, hospital bank details, and `loanType === 'healthcare_individual'`. A future SME lender would require `loanType === 'business'` and a CAC number. `supportedLoanTypes` makes this filtering efficient.

### Provider Registry

A `LendingProviderRegistry` service holds all registered providers. When admin moves to Stage 5 (provider submission), the registry returns which providers can handle this application based on its loan type, amount, and data completeness. Admin selects from the eligible list. If only one qualifies, it is pre-selected.

### P2Vest as First Implementation

Wrap the existing `p2vest.service.ts` behind the `LendingProvider` interface. No logic changes — just conform to the contract. All existing P2Vest behaviour is preserved. Set `supportedLoanTypes: ['healthcare_individual']`.

### Schema Changes — Provider-Agnostic Fields

Replace `p2vest*` fields on `LoanApplication` with:

- `lendingProvider` — provider ID string (e.g. "p2vest")
- `providerRequestId`
- `providerDecision` — `{ status, creditScore, riskRating, recommendedAmount, recommendedTenure, affordabilityScore, confidenceScore, declineReasons[], decidedAt }`
- `providerLoanId`
- `repaymentAccountNumber`, `repaymentAccountName`, `repaymentAccountBank`
- `disbursementStatus`
- `providerPayload` — mixed object, stores the full raw provider response for audit

Keep P2Vest-specific field names in `providerPayload` so no audit history is lost.

---

## Phase 5 — New Admin Review Flow (5 days)

The ApplicationDetail page becomes a **flexible toolkit**, not a rigid linear pipeline. Lookup (BVN/NIN verification) and Connect (bank account linking) are independent tools. The reviewer uses them based on what the case needs — not because the system forces a sequence.

### The Core Principle

BVN verification and bank account linking are separate. A reviewer can verify BVN and go straight to provider submission without ever touching Mono Connect. P2Vest does its own credit scoring — Mono Connect enriches that decision but is not a prerequisite for it. Some applications will go BVN → documents → P2Vest directly. Others will need the full bank statement and credit analysis first. The reviewer decides.

### The Toolkit Sections

The review page is organised into sections, not enforced stages. Each section shows its current state and offers its available actions. Sections that are not applicable or not yet actioned show as inactive but are never hidden — the reviewer can always see the full picture.

**Identity Verification (Lookup — independent)**

Always available from the moment the application arrives. Shows the BVN and NIN the applicant entered. Action: **"Verify BVN"** (₦45). Result appears inline: verified name, match status against stated name, pass/fail/override. This section has no dependency on anything else and nothing else depends on completing it before it can proceed — it is a data point the reviewer uses to inform their judgment, not a gate.

**Bank Statement (Connect — independent, optional)**

Completely independent of identity verification. The reviewer decides whether the case warrants fetching a bank statement. If yes: send the Mono Connect link to the customer, wait for linking, then fetch the statement. If the reviewer judges the case can be decided without it — via BVN + form data + P2Vest's own scoring — they skip this section entirely and move to provider submission. No system warning or block prevents this.

Action: **"Send bank link"** → customer links bank → **"Fetch bank statement"** → statement and transactions stored.

**Credit Analysis (depends only on statement being fetched)**

Available only if a statement has been fetched. Action: **"Run credit analysis"** (Gemini + rule engine). Shows income, debt, DTI, credit score, red flags, narrative. If no statement was fetched, this section is inactive and the reviewer proceeds without it.

**Document Review (independent)**

Available at any time. Shows all uploaded documents. Reviewer approves/rejects each, or requests additional documents. Not a gate for anything — just a record of document status that informs the overall decision.

**Provider Submission**

Available when the reviewer is satisfied with the data they have. The system checks what the selected provider requires via `canHandle()` — if BVN is missing, it flags that. If hospital bank details are missing for P2Vest, it flags that. But bank statement and credit analysis are not requirements — they are signals. The reviewer sees a checklist of what is complete and what is missing, makes a judgment call, and submits when ready.

Action: select provider from eligible list → review data being sent → **"Submit for credit review"** → decision inline.

**Offer and Disbursement**

If approved: show offer, accept, show repayment account. Track disbursement status via webhook.

### Layout

Left sidebar — all sections listed with their current state (complete / partial / not started / not applicable). Clicking a section scrolls to it.

Main area — each section's content and actions, in a logical reading order top to bottom.

Right panel — applicant snapshot (name, loan type, amount, tenor, form risk flags), current workflow status badge, audit log.

---

## Phase 6 — Applicant Portal Improvement (3 days)

### Status Tracker

Replace the single status label with a vertical stepper: Submitted → Under Review → Verification → Assessment → Decision → Active. Each completed step shows its date. The current step shows a contextual message suited to the loan type, for example "We are reviewing your business bank statement and verifying your CAC registration" for a business loan.

### Document Upload Flow

If a document is requested by admin, the status page shows a clear alert: exactly what is needed with a direct upload link. In-app upload when the customer is logged in, rather than the current token-email approach.

### Notification Touchpoints

- Application submitted → confirmation with reference number and loan type summary
- Mono connect link sent → branded email: "Complete your bank verification"
- Document requested → specific email naming exactly what is needed
- Decision made → clear email (approved with next steps, or not approved with reason where policy allows)

---

## Provider Addition Guide — For Future Providers

To add a new lending provider after P2Vest:

1. Create `src/providers/{name}/{name}.service.ts` implementing `LendingProvider`
2. Set `supportedLoanTypes` to the loan types this provider handles
3. Implement `canHandle()` with the provider's eligibility rules
4. Register in `LendingProviderRegistry`
5. Add provider-specific env variables to `.env`
6. Add the provider's webhook endpoints to the webhook controller
7. No frontend changes needed — the provider appears automatically in Stage 5 when `canHandle()` returns true

---

## What Does Not Change

- The multi-role structure (Sales / Admin / Credit Officer / Financier / Provider / Customer)
- The audit log system
- Document upload via Cloudinary
- The repayment tracking structure
- The hospital/provider management system
- The direct debit code (suspended, not removed — reactivate when needed)

---

## Summary — Build Order

**Week 1** — Update Mono keys, Phase 1 (UI fixes), Phase 2 (Mono rewire, suspend direct debit UI)

**Week 2** — Phase 3 (transaction analysis engine, hybrid rule + Gemini classifier)

**Week 3** — Phase 4 (provider abstraction framework)

**Week 4** — Phase 5 (flexible admin review flow — toolkit not pipeline)

**Week 5** — Phase 6 (applicant portal improvements) and end-to-end testing on healthcare individual flow

**Week 6+ (after everything above is stable)** — Phase 7: Business Loan. Separate form, separate route, no changes to existing healthcare form. Plugs into the same review infrastructure and provider registry.

---

## How It Works End to End

### Healthcare Individual

The applicant selects "Healthcare" on the loan type screen, completes the 5-step form including hospital selection, and submits. They receive a confirmation with their reference number.

The sales officer claims the application, verifies BVN (₦45), sends the Mono bank link, fetches the statement once the customer links their bank, runs credit analysis, and reviews documents. They approve for credit review.

The credit officer selects P2Vest at Stage 5, submits, receives the credit decision, accepts the offer. P2Vest disburses to the hospital. The patient receives the repayment account and pays monthly.

### Business Loan (Phase 7 — separate, implemented last)

The business loan has its own form at a separate route. It does not affect the healthcare flow in any way. Walk-through to be documented when Phase 7 is built.

---

*This document is the authoritative plan for the rebuild. All implementation decisions should be checked against it. Update it when decisions change.*
