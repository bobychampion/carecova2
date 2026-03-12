<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CareCova frontend

This repo is the **frontend only**. Pushing here does **not** change or deploy the backend (the backend is a separate service/repo).

## Run locally

**Prerequisites:** Node.js (18+ recommended)

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Create `.env`** in the project root (same folder as `package.json`). Add one line per variable, for example:
   ```env
   VITE_API_BASE_URL=https://care-cova-api.onrender.com
   ```
   - Use `https://care-cova-api.onrender.com` to use the hosted backend.
   - Use `http://localhost:3000` only if you are running the backend locally.

3. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

Optional (if you use image uploads): add `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` to `.env`. Do **not** put the Cloudinary API secret in the frontend.

## If the app looks broken after clone/pull

- Run **`npm install`** so dependencies and assets are correct.
- Create a **`.env`** file with at least `VITE_API_BASE_URL` (see above). Without it, the app may behave differently or assets may not load as expected.
- Restart the dev server after changing `.env` (`Ctrl+C` then `npm run dev`).

## Deploy

- Build: `npm run build` → output in `dist/`.
- The app uses `base: '/'`; if you deploy to a subpath (e.g. `https://example.com/carecova/`), set `base: '/carecova/'` in `vite.config.ts` and rebuild.
