# Carecova – Financial Flow Walkthrough (One Loan)

This document traces **one concrete loan** through the new commission and interest structure so you can sanity-check amounts at each stage.

---

## Example loan

| Field | Value |
|-------|--------|
| **Principal (approved amount)** | ₦2,500,000 |
| **Tenor** | 6 months |
| **Monthly lending rate** | 5% (from config) |
| **Assigned sales** | sales1 |
| **Provider commission** | 7% |
| **Sales approval** | 2% |
| **Sales interest** | 7% of interest |
| **Sales repayment bonus** | 5% of interest collected |

---

## 1. Lending interest (company revenue)

**Formula (simple interest):**  
`totalAmount = principal × (1 + rate × tenor)`  
`totalInterest = totalAmount − principal`

- `totalAmount` = 2,500,000 × (1 + 0.05 × 6) = 2,500,000 × 1.30 = **₦3,250,000**
- `totalInterest` = 3,250,000 − 2,500,000 = **₦750,000**
- `monthlyPayment` = 3,250,000 ÷ 6 = **₦541,667** (rounded)

**Repayment schedule (on-time, no compounding):**

| Month | Due (₦) | Cumulative paid | Outstanding |
|-------|----------|------------------|-------------|
| 1 | 541,667 | 541,667 | 2,708,333 |
| 2 | 541,667 | 1,083,334 | 2,166,666 |
| 3 | 541,667 | 1,625,001 | 1,624,999 |
| 4 | 541,667 | 2,166,668 | 1,083,332 |
| 5 | 541,667 | 2,708,335 | 541,665 |
| 6 | 541,665 | 3,250,000 | 0 |

Customer pays **₦3,250,000** total; company interest revenue = **₦750,000**.

---

## 2. Provider commission (at disbursement)

**Rule:** Provider receives loan amount **minus 7%**; platform keeps 7%.

- **Approved (loan amount)** = ₦2,500,000  
- **Provider commission (7%)** = 2,500,000 × 0.07 = **₦175,000** (platform revenue)  
- **Amount to provider** = 2,500,000 × 0.93 = **₦2,325,000**

Org wallet is debited by **₦2,325,000** (cash sent to hospital). The ₦175,000 is retained (not a separate credit at disbursement).

---

## 3. Sales commission – stream 1 (approval + interest)

### 3a. Approval commission (at credit approval)

- **Trigger:** Loan status → approved.  
- **Amount:** 2% of approved amount = 2,500,000 × 0.02 = **₦50,000**.  
- **Status:** `available` (withdrawable).

### 3b. Interest commission (at disbursement)

- **Trigger:** Disbursement success.  
- **Amount:** 7% of **projected** total interest = 750,000 × 0.07 = **₦52,500**.  
- **Status:** `locked`; unlocks proportionally as customer pays.

---

## 4. Proportional unlock of 7% interest commission

Each repayment is treated as part principal, part interest in proportion to the schedule:

- **Interest fraction of each payment** = `totalInterest / totalRepayment` = 750,000 / 3,250,000 ≈ **23.08%**.  
- So per installment of ₦541,667, **interest portion** ≈ 541,667 × 0.2308 ≈ **₦125,000**.

**Unlock per payment:**  
`(interestPortionOfPayment / totalProjectedInterest) × 52,500`  
≈ (125,000 / 750,000) × 52,500 = **₦8,750** per month.

| After payment # | Interest paid (approx) | Unlocked (7% commission) | Locked remaining |
|-----------------|------------------------|---------------------------|------------------|
| 1 | 125,000 | 8,750 | 43,750 |
| 2 | 125,000 | 8,750 | 35,000 |
| 3 | 125,000 | 8,750 | 26,250 |
| 4 | 125,000 | 8,750 | 17,500 |
| 5 | 125,000 | 8,750 | 8,750 |
| 6 | 125,000 | 8,750 | 0 |

After 6 months, the full **₦52,500** interest commission is unlocked (or any remainder is released on completion).

---

## 5. Sales commission – stream 2 (repayment bonus on completion)

- **Trigger:** Loan status → **completed** (all installments paid).  
- **Amount:** 5% of **total interest actually collected** = (totalPaid − principal) × 0.05.  
  - totalPaid = 3,250,000, principal = 2,500,000 → interest collected = **₦750,000**.  
  - 5% × 750,000 = **₦37,500**.  
- **Status:** `available`.

---

## 6. Sales wallet summary (for this one loan)

| Item | Amount (₦) | When |
|------|------------|------|
| Total commission earned (this loan) | 50,000 + 52,500 + 37,500 = **140,000** | — |
| Approval (2%) | 50,000 | At approval |
| Interest (7% of projected) | 52,500 | Unlocked over 6 repayments |
| Repayment bonus (5% of interest collected) | 37,500 | At completion |

**Dashboard after loan completion:**

- **Total earned:** +₦140,000 (all time for sales1).  
- **Locked:** 0 (all unlocked).  
- **Available:** 50,000 + 52,500 + 37,500 = **₦140,000** (until withdrawn).  
- **Withdrawn:** 0 (until sales withdraws).

---

## 7. End-to-end cash / P&L (this loan)

| Party | Flow |
|-------|------|
| **Customer** | Pays ₦3,250,000 over 6 months (principal ₦2,500,000 + interest ₦750,000). |
| **Provider** | Receives ₦2,325,000 at disbursement (93%). |
| **Platform** | Retains ₦175,000 provider commission; earns ₦750,000 lending interest; pays ₦140,000 sales commission. |
| **Sales (sales1)** | Earns ₦140,000 (2% + 7% of interest + 5% completion bonus). |

---

## 8. Sanity checks

1. **Lending:** 5% × 6 = 30% simple interest on principal → 750k interest on 2.5M ✓  
2. **Provider:** 7% of 2.5M = 175k; provider gets 93% = 2,325k ✓  
3. **Sales approval:** 2% of 2.5M = 50k ✓  
4. **Sales interest:** 7% of 750k = 52.5k ✓  
5. **Sales bonus:** 5% of 750k = 37.5k ✓  
6. **Total sales:** 50k + 52.5k + 37.5k = 140k ✓  

If you change tenor or principal, use the same formulas; the code uses these exact relationships (see `lendingEngine.js`, `commissionService.js`, and `adminService.js` confirmDisbursement / recordPayment).
