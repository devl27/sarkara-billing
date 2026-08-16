# Sarkara's — Stall Billing App

Touch-first billing app for Sarkara's food stall at KSP Onachanda 2026.

- 🧾 Tap-to-bill grid with big icons, auto total, custom amounts
- 📱 UPI QR generation with exact bill amount (set UPI ID in Settings)
- 📊 Reports: total sales, QR vs cash split, item-wise, recent bills
- ⚙️ Editable menu items & rates
- 🔐 Simple shared login (set `APP_USERNAME` / `APP_PASSWORD` env vars on Vercel; defaults `sarkara` / `onam2026`)
- ☁️ Cloud sync of sales via Vercel Blob (`/api/sales`) — reports aggregate across devices; localStorage keeps working offline
- ⬇️ Export all sales to Excel (CSV) from the Reports tab

## Deploy
Deployed on Vercel. `index.html` is static; `api/` holds two small serverless functions.
Requires a Vercel Blob store connected to the project (`BLOB_READ_WRITE_TOKEN` env var) for cloud sync — without it the app still works, per-device.
