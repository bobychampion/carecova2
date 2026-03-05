# Carecova – Presentation & demo guide

Quick reference for showing the **customer journey** in demos and presentations.

---

## Customer welcome (after apply)

1. **Apply flow** – Go to **Apply** and complete the application (or use test data).
2. **Success screen** – After submit, the customer sees:
   - **Welcome to Carecova** with a clear success message
   - **Application ID** in a copy-friendly box
   - **What happens next** (review → contact → decision → disbursement)
   - **Track your application** and **Return home**
3. **Welcome page** – You can also open `/welcome?loanId=YOUR_ID` to show the same welcome (e.g. for email/SMS link mock-ups).

---

## Presentation mock customer (Track page)

To show a customer **already in the journey** (active loan, repayments in progress):

1. Go to **Track** (from the main nav or `/track`).
2. Enter application ID: **`LN-DEMO`**
3. Click **Track Status**.

You’ll see:

- **Welcome back, Chioma!** (and a “Presentation demo” badge)
- **Repayment dashboard** for **Chioma Eze**:
  - ₦500,000 approved, 6 months
  - Total repayable ₦650,000
  - 2 of 6 installments paid (₦216,666 paid, ₦433,334 outstanding)
  - Next payment due
  - Repayment schedule with paid/unpaid installments

Mock details for **LN-DEMO**:

| Field        | Value                    |
|-------------|---------------------------|
| Name        | Chioma Eze                |
| Hospital    | Reddington Hospital       |
| Treatment   | Elective knee surgery     |
| Employer    | GTBank Plc                |
| Approved    | ₦500,000 for 6 months     |
| Status      | Active (2 repayments in)  |

The **LN-DEMO** application is always injected into the app data if missing, so it’s available even after clearing storage.
