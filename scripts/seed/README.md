# Backend seed data

Use this to add **demo loan applications** to your backend so the CareCova admin panel shows data when using **only backend** (no local mock).

## What’s included

- **`loan-applications.json`** – 3 sample loan application payloads in the same shape the frontend sends to `POST /api/loan-applications`.

## How to seed

### Option 1: Node script (recommended)

From the **project root** (carecova frontend repo):

```bash
node scripts/seed/seed-backend.js
```

Uses `https://care-cova-api.onrender.com` by default. To target another API:

```bash
API_BASE_URL=http://localhost:3000 node scripts/seed/seed-backend.js
```

The script POSTs each application to `{API_BASE_URL}/api/loan-applications` and prints created IDs or errors.

### Option 2: curl (one payload per request)

If your backend accepts a single object per request, copy one object from `loan-applications.json` into a file (e.g. `app1.json`) and run:

```bash
API="https://care-cova-api.onrender.com"
curl -X POST "$API/api/loan-applications" \
  -H "Content-Type: application/json" \
  -d @app1.json
```

Repeat with different objects for more applications.

### Option 3: Backend API docs (Swagger)

1. Open `https://care-cova-api.onrender.com/api/docs` (or your backend’s docs URL).
2. Find **POST /api/loan-applications**.
3. Use “Try it out” and paste the body of one object from `loan-applications.json`.

## Admin user

The frontend does **not** seed admin users. Create the first admin on the backend with:

**POST** `/api/admins/bootstrap-super-admin`  
(body: `username`, `email`, `password` min 8 chars, optional `displayName`).

If the backend returns **409 “Super admin already exists”**, use the existing admin credentials to log in.
