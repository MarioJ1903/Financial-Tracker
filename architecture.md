# Architecture

## Overview
RuangDana is a React single-page application built with Vite and hosted as static assets. It runs in local demo mode or connects to Supabase Auth and Postgres when public project credentials are configured.

```text
Browser
  ├─ React UI and derived monthly metrics
  ├─ local demo mode: localStorage (this browser/device only)
  └─ configured mode: Supabase Auth → Postgres transactions table with RLS
             │
             └─ Vite production build → Cloudflare Workers static assets (or another static host)
```

## Runtime and data flow
1. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set, the app loads a Supabase Auth session and requires email/password sign-in before rendering financial data. Without them, it runs in local demo mode.
2. In Supabase mode, the app reads and inserts rows in `public.transactions`. PostgreSQL sets `user_id` from `auth.uid()` and row-level security policies scope access to the signed-in user. Never use a secret or service-role key in this client.
3. In local demo mode, the app reads and saves browser-local records using `ruangdana-transactions`. If there are no records yet, it displays sample data.
4. The selected month filters records by local calendar month/year. Income, expenses, and net balance are computed from the filtered records.
5. Search and transaction-type tabs filter visible rows. CSV export downloads the selected month's records.
6. Recharts groups selected-month transactions by calendar day. The budget panel compares recorded category expenses against example monthly limits defined in the UI.

## Persistence and privacy
- The production build is served as Cloudflare Worker static assets from `dist`, configured in `wrangler.jsonc`; Git builds run `npm run build` followed by `npx wrangler deploy`.
- In Supabase mode, records sync for the same authenticated account across devices. RLS policies are defined in `supabase/schema.sql`.
- In demo mode, localStorage remains local to each browser/device. Clearing browser site data removes the local copy.
- CSV export is available as a backup. The app does not yet import existing localStorage records into Supabase.
- The app does not connect to banks. It stores manually entered records; use a unique account password and keep Supabase secret/service-role keys out of client code.

## Suggested evolution
For configurable budgets, persist user-defined category limits instead of example limits. Add CSV import/migration, transaction editing/deletion, password reset, and tests for month boundaries, IDR formatting, RLS behavior, and CSV escaping as the app grows.
