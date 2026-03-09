# Backend integration checklist

Carecova frontend can run in **local/mock mode** (current default) or use a **separate backend**. This doc lists what’s required for proper integration.

---

## Plain English: set up the backend step by step

**Step 1 – Get your backend live**  
- Your backend is already live at **https://farmconnect-backend-xsio.onrender.com** (it returns “Hello World!” when you open it).  
- So you can skip deploying; just use that URL in the steps below.

**Step 2 – Allow the frontend to call it (CORS)**  
- CORS is already configured in the backend’s `app.js`. Allowed origins include:
  - `http://localhost:5173` (Vite local dev – Carecova works out of the box),
  - `http://localhost:5174` / `5175` / `3000`,
  - `https://www.sosocare.com`, `https://admin.sosocare.com`, `https://sosocare-admin.vercel.app`.
- All common methods (GET, POST, PUT, DELETE, PATCH, OPTIONS) and credentials are allowed.  
- **If you deploy Carecova on a different URL** (e.g. `https://carecova.vercel.app`), add that origin to the CORS list in `app.js`.

**Step 3 – Tell the frontend where the backend is**  
- In the Carecova frontend repo, create a file named `.env` in the project root (same folder as `package.json`).  
- Put this line in it (no slash at the end):  
  `VITE_API_BASE_URL=https://farmconnect-backend-xsio.onrender.com`  
- Restart the frontend dev server if it’s running so it picks up the new value.

**Step 4 – Add the first API the frontend actually uses**  
- The frontend already tries to load one application by ID when someone uses “Track” or views a loan.  
- Your backend must respond to: **GET** requests to `/api/loan-applications/:id` (where `:id` is the application/loan ID).  
- That endpoint should return the loan/application data as JSON. If the loan doesn’t exist, return a 404.  
- Once this works, the Track page can show data from your backend instead of only from the browser’s storage.

**Step 5 – (Optional) Save new applications to the backend**  
- Right now, when someone applies, the form only saves inside the browser.  
- To save applications in your database, add an endpoint: **POST** `/api/loan-applications`.  
- It should accept the JSON body the frontend sends (patient name, amount, duration, location, hospital, documents, consents, etc.), save it in MongoDB (or your DB), and return the saved application (including an `id` and something like `status: 'pending'`).  
- The frontend can later be switched to call this instead of saving only in the browser (see section 4 below).

**Step 6 – (Optional) Admin login and loan list from the backend**  
- Today, admin login and the list of loans in the admin panel are fake (stored only in the browser).  
- To use real admin accounts and real data:  
  - Add **POST** `/api/admins/auth/login` (send username + password, return something like `accessToken`, `refreshToken`, and admin info).  
  - Add **POST** `/api/admins/auth/refresh` and **POST** `/api/admins/auth/logout` if you want refresh and logout.  
  - Add **GET** `/api/admin/loan-applications` to return the list of loans and **GET** `/api/admin/loan-applications/:id` to return one loan.  
- The frontend can then be changed to call these instead of using local storage (again, see section 4).

**Step 7 – (Optional) Wallets and Mono**  
- If you use the “Org Wallets” page or Mono (bank connection) in the app, your backend will need the wallet and Mono endpoints listed in section 3.4 and 3.5 below. You can add those when you’re ready.

**Summary:**  
Do steps 1–4 to get the backend set up and the frontend talking to it for viewing one application. Do steps 5–7 when you want to save applications to the DB, use real admin login and loan list, and use wallets/Mono.

---

## 1. Frontend configuration

| Item | Action |
|------|--------|
| **API base URL** | In this repo, create `.env` with `VITE_API_BASE_URL=https://your-backend.onrender.com` (no trailing slash). The app uses `API_ROOT = ${VITE_API_BASE_URL}/api`. |
| **CORS** | Backend must allow the frontend origin (e.g. your Vercel/Netlify URL or `http://localhost:5173`) in CORS. |

---

## 2. Current behaviour (what’s local vs API)

When **`VITE_API_BASE_URL`** is set in `.env`, the app uses the backend for:

| Area | When backend URL is set | Fallback when backend missing/fails |
|------|-------------------------|-------------------------------------|
| **Admin login** | Tries `POST /api/admins/auth/login` first | Local users (admin, sales1, etc.) |
| **Admin: loans list** | `GET /api/admin/loan-applications` (with Bearer token) | localStorage |
| **Admin: loan detail** | `GET /api/admin/loan-applications/:id` | localStorage |
| **Apply (submit)** | `POST /api/loan-applications` with `buildApiPayload()` | Local submit only when no URL set |
| **Track / get application** | `GET /api/loan-applications/:id` | localStorage |

When `VITE_API_BASE_URL` is empty or unset, everything uses localStorage/mock. Admin: wallets and Mono remain stubbed; customer OTP is still mock.

---

## 3. Backend API contract (what the frontend expects)

Base URL for all below: `VITE_API_BASE_URL` + `/api` (e.g. `https://farmconnect-backend-xsio.onrender.com/api`).

### 3.1 Loan applications (used or planned)

| Method | Path | When used | Notes |
|--------|------|-----------|--------|
| GET | `/loan-applications/:id` | When viewing one application/loan (e.g. Track) | Used now. Frontend merges with local data if present. |
| POST | `/loan-applications` | When “properly integrated” for apply flow | Not used yet; frontend has `buildApiPayload()` and would send that body. |

**POST /loan-applications body (from frontend `buildApiPayload`):**  
Nested shape with `patientName`, `estimatedCost`, `preferredDuration`, `location`, `hospital`, `documents`, `consentDataProcessing`, `consentTerms`, etc. Backend can accept this and return the created loan (e.g. with `id`, `status: 'pending'`).

### 3.2 Admin auth (for full integration)

| Method | Path | Body / response |
|--------|------|-----------------|
| POST | `/admins/auth/login` | Body: `{ usernameOrEmail, password }`. Response: `{ accessToken, refreshToken, admin }`. |
| POST | `/admins/auth/refresh` | Body: `{ refreshToken }`. Response: `{ accessToken, refreshToken, admin }`. |
| POST | `/admins/auth/logout` | Body: `{ refreshToken }`. Header: `Authorization: Bearer <accessToken>`. |

Session checks: frontend would send `Authorization: Bearer <accessToken>` on admin API requests.

### 3.3 Admin loan applications (for full integration)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/admin/loan-applications` | Optional query params. Return list of loans. |
| GET | `/admin/loan-applications/:id` | Single loan. |

### 3.4 Wallets (Org Wallets page)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/wallets` | Query: ownerType, purpose, status, etc. |
| GET | `/wallets/overview` | |
| GET | `/wallets/transactions` | |
| GET | `/wallets/:id/statement` | |
| POST | `/wallets/:id/fund` | |
| POST | `/wallets/:id/debit` | |

### 3.5 Mono (informed decision)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/admin/loan-applications/:id/mono/connect/initiate` | |
| POST | `/admin/loan-applications/:id/mono/informed-decision` | |
| POST | `/admin/loan-applications/:id/mono/informed-decision/sections/:section` | |

---

## 4. What to do for “proper” integration

### Backend (your separate repo)

1. **CORS** – Allow the frontend origin.
2. **At least:**  
   - `GET /api/loan-applications/:id` – so Track (and any loan detail) can load from API when available.
3. **For full apply → backend:**  
   - `POST /api/loan-applications` – accept the payload from `buildApiPayload()` (or your backend’s equivalent), persist to DB, return created loan.
4. **For admin to use backend:**  
   - Admin auth: `POST /api/admins/auth/login`, refresh, logout.  
   - Loans: `GET /api/admin/loan-applications`, `GET /api/admin/loan-applications/:id`.  
5. **Optional:** Wallets and Mono endpoints above if you use Org Wallets and Mono in the UI.

### Frontend (this repo)

1. **Set `.env`**  
   - `VITE_API_BASE_URL=https://your-actual-backend.onrender.com`

2. **Optional: switch apply to API**  
   - In `loanService.js`, change `submitApplication` to call `request('POST', '/loan-applications', buildApiPayload(applicationData))` and then normalize and store the returned loan (and optionally sync to local for offline fallback).

3. **Optional: switch admin to API**  
   - Replace local login in `adminService.js` with `POST /api/admins/auth/login`, store `accessToken` / `refreshToken`, and use `Authorization: Bearer` for admin requests.  
   - Make `getAllLoans` and `getLoanById` call `GET /api/admin/loan-applications` and `GET /api/admin/loan-applications/:id` (with auth).  
   - This was the “remote” behaviour before the merge; it can be re-enabled once the backend matches.

4. **Optional: customer auth**  
   - Replace mock OTP in `customerAuthService.js` with backend “request OTP” and “verify OTP” endpoints when you have them.

---

## 5. Quick checklist

- [x] Backend deployed and reachable: **https://farmconnect-backend-xsio.onrender.com**
- [x] Backend CORS allows frontend origin (configured in `app.js`; add Carecova deploy URL if different).
- [ ] Frontend `.env` has `VITE_API_BASE_URL` pointing to that backend (no trailing slash).
- [ ] Backend implements at least `GET /api/loan-applications/:id` (so Track can use API).
- [ ] (Optional) Backend implements `POST /api/loan-applications` and frontend submit is switched to it.
- [ ] (Optional) Backend implements admin auth + loan list/detail and frontend admin is switched to API.

Once these are in place, the app is properly integrated to the backend for the flows you enable.
