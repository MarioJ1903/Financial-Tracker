# AGENT.md

## Project overview
RuangDana is a responsive, Indonesian-language personal finance dashboard built with React and Vite. It provides monthly income/expense summaries, cash-flow visualization, budget overview, transaction filtering/search, CSV export, transaction entry, and optional Supabase Auth/Postgres persistence.

## Development conventions
- Keep UI labels, dates, and financial formatting in Indonesian (`id-ID`) and Indonesian rupiah (IDR).
- Use functional React components and hooks. Keep transaction totals derived from transaction records rather than stored separately.
- Keep the responsive layouts usable at 320px and above; verify both narrow mobile and desktop layouts after UI changes.
- If Supabase env vars are configured, use the Supabase client and `public.transactions`; preserve per-user ownership via RLS and never use secret/service-role keys in frontend code.
- Without Supabase env vars, preserve local demo behavior using the `ruangdana-transactions` localStorage key.
- Keep `.env.local` out of Git. Use `.env.example` for variable names only.
- Keep charts accessible with labels/tooltips and controls with descriptive accessible names.
- Keep dependencies minimal. `npm run build` is the production build command.

## Main files
- `src/App.jsx`: Dashboard, transaction behavior, and chart.
- `src/styles.css`: Visual system and responsive styles.
- `src/main.jsx`: React entry point.
- `src/supabase.js`: Supabase browser client setup.
- `supabase/schema.sql`: transaction table and row-level security policies.
- `architecture.md`: System overview and data-flow notes.
- `DEPLOYMENT.md`: Supabase, Git, Cloudflare Pages setup and other hosting instructions.
