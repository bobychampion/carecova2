# Frontend requirements vs documentation & where integrations live

This document checks the CareCova MVP docs against the current frontend and clarifies **where Dojah, Mono, and Remita integration happens** (backend only).

---

## Where Dojah, Mono, and Remita live: **backend only**

**Dojah, Mono, Remita (and FirstCentral) are backend integrations.** The frontend does **not** call these services.

| Provider       | Role (from docs)                    | Where it runs        | Frontend role                          |
|----------------|-------------------------------------|----------------------|----------------------------------------|
| **Dojah**      | Identity & KYC (BVN, NIN, liveness) | Backend (Render)     | Only **displays** identity/KYC status |
| **FirstCentral** | Credit bureau screening           | Backend (Render)     | Only **displays** credit status        |
| **Mono**       | Banking & income verification      | Backend (Render)     | Only **displays** banking/income status|
| **Remita**     | Payroll (govt), payment rails      | Backend (Render)     | Only **displays** payroll status       |

- **Deployment doc (PDF):** “Secure integrations: Mono + Remita” and “Background job worker – Run verifications (Mono/Remita calls)” are under **Render (backend)**. The diagram shows: Frontend → API → Backend; Backend → Mono / Remita (outbound HTTPS).
- **CARECOVA MVP doc:** “Verification Stack” (Dojah, FirstCentral, Mono, Remita) involves API keys, BVN/NIN, bank statements, payroll — all server-side. The frontend never holds or uses these APIs.
- When a real backend exists, it will call Dojah/FirstCentral/Mono/Remita and store results (e.g. `verificationStatus`, `riskScore`). The frontend will **consume** that data via REST (e.g. GET application/offer) and show it in the admin “Verification & risk” section.

So: **Dojah, Mono, Remita (and FirstCentral) integration = backend. Frontend = submit data, upload docs, and display verification/risk/offer/repayment.**

---

## Doc vs frontend checklist

Sources: *CareCova MVP — Simple Deployment (PDF)* and *CARECOVA MVP.docx*.

### Applicant portal (Vercel frontend)

| Doc requirement              | Frontend implementation | Status |
|-----------------------------|--------------------------|--------|
| Application form            | Apply.jsx – 5 steps (personal, hospital, financial, documents, review) | Met |
| Consent capture             | Apply step 5 – ConsentCheckbox (data processing, terms, marketing)    | Met |
| KYC uploads                 | Apply step 4 – DocumentUpload (treatment estimate, ID, payslip)       | Met |
| Employment / work details   | Apply step 1 – employment sector, employer, job title                | Met |
| Offer acceptance (OTP flow) | Offer.jsx – offer summary, 6-digit OTP, mock 123456, accept → track  | Met |
| Repayment status & schedule | Track.jsx, RepaymentDashboard, RepaymentSchedule, MakePayment         | Met |

### Admin portal (Vercel frontend)

| Doc requirement                    | Frontend implementation | Status |
|-----------------------------------|-------------------------|--------|
| Queue of applications             | AdminDashboard – table, filters, search                             | Met |
| View verification reports         | LoanDetailModal – “Verification & risk” (Dojah, FirstCentral, Mono, Remita) | Met (UI only; data is placeholder until backend) |
| View risk score                   | LoanDetailModal – Risk score & recommendation                       | Met (UI only; placeholder) |
| Approve / reject / modify offer   | LoanDetailModal – Approve, Reject, Modify offer forms               | Met |
| Record reason + timestamp         | adminService stores decidedAt/rejectedAt/modifiedAt; modal shows them | Met |

### Not frontend (backend / future)

| Item                         | Owner   | Note |
|-----------------------------|--------|------|
| Dojah / Mono / Remita / FirstCentral **calls** | Backend | API keys, server-to-server only |
| Risk score **calculation**  | Backend | Frontend displays value from API |
| Verification **execution**  | Backend jobs | After application submit |
| OTP **sending** (real SMS/email) | Backend | Frontend currently uses mock OTP |
| Disbursement to hospital   | Backend | Frontend only shows loan/repayment state |

---

## Summary

- **Frontend:** Application form + consent, work details, KYC uploads, offer acceptance (OTP), repayment view; admin queue, verification/risk **display**, approve/reject/modify with reason and timestamp. All doc-listed **frontend** responsibilities are implemented (with mock OTP and placeholder verification/risk until backend exists).
- **Dojah, Mono, Remita (and FirstCentral):** Integrated only in the **backend**. The frontend does not integrate with them; it only shows the verification and risk data that the backend will provide via APIs.
