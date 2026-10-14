# Deploy RuangDana

The app can be published as a static site. After deployment, open its HTTPS URL on your phone or any other device.

## Full setup: Supabase + Git + Cloudflare Workers

The app supports two modes: without Supabase credentials it uses demo/local browser storage; with Supabase credentials it requires sign-in and reads/writes each user's transactions in Supabase. The database schema and row-level security policies are in `supabase/schema.sql`.

### 1. Create the Supabase project and table

1. Create a project in the Supabase Dashboard and wait for its database to be ready.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the transactions table, indexes, grants, and per-user row-level security policies.
3. Open **Project Settings → API Keys** (or the project Connect dialog) and copy the **Project URL** and **Publishable key**. The browser app only needs the publishable key. If an older project shows an `anon` key instead, that legacy public key is also supported by this app.

### 2. Configure local development

From the project folder in PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and fill in the values:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Then install dependencies and start the site:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. Create an account from the sign-in screen. If Supabase email confirmation is enabled, confirm the signup link sent to your email before signing in. `.env.local` is ignored by Git; never commit it.

### 3. Set Supabase Auth URLs

In Supabase, open **Authentication → URL Configuration**:

- During local development, set **Site URL** to `http://localhost:5173` and add `http://localhost:5173/**` to **Redirect URLs**.
- After the first Cloudflare deployment, change **Site URL** to the exact production `https://<worker>.<account>.workers.dev` URL and add that exact URL (or `https://<worker>.<account>.workers.dev/**`) to **Redirect URLs**.
- If you use Cloudflare preview deployments for signup links, add the preview URL shown in Cloudflare to **Redirect URLs**.

The Site URL is used for email confirmations when the app does not specify a redirect URL. Supabase recommends using the exact production URL and allowing local/preview URLs separately.

### 4. Save the project in Git

Create an empty GitHub or GitLab repository first. Then, in PowerShell at the project root, set your actual repository URL and push the first commit:

```powershell
git init
git add .
git commit -m "feat: add RuangDana finance tracker"
git branch -M main
git remote add origin https://github.com/USERNAME/financial-tracker.git
git push -u origin main
```

If `git remote -v` already shows the correct repository, skip `git remote add origin ...`. `.gitignore` excludes `node_modules`, `dist`, and `.env*` (except `.env.example`); check `git status` before pushing to ensure credentials are not staged.

### 5. Deploy from GitHub to Cloudflare Workers

1. In Cloudflare, open **Workers & Pages → Create application → Connect GitHub** and authorize access to this repository.
2. Select this repository and use the following settings:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
   - **Root directory:** `/`
   - Keep `wrangler.jsonc` in the repository; it configures `dist` as the static asset directory and enables single-page-app fallback routing.
3. Add these two variables in **Settings → Builds → Variables and secrets** for the **Production** build:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = your Supabase Publishable key
4. Save and deploy. Enable the `workers.dev` subdomain under **Settings → Domains & Routes**. Cloudflare then publishes the site at `https://<worker>.<account>.workers.dev`.
5. Copy the production URL back to the Supabase **Site URL** and **Redirect URLs** settings above.
6. Open the production URL on your phone and sign in using the same email/password account. Your records are stored in Supabase, so the same account can access them on other devices.

When credentials change in Cloudflare, trigger a new deployment because Vite embeds `VITE_` variables into the static build. Future Git pushes to `main` deploy automatically. Preview branches can have their own Cloudflare URLs.

### 6. Protect existing local records

Supabase mode starts with the database records; it does not automatically migrate any transactions already stored in a browser's localStorage. Export a CSV from the old local version before switching. Keep that export as a backup; the app currently has no CSV import screen.

The Supabase publishable key is visible in the built web app by design. The SQL enables RLS so signed-in users can only access rows with their own `user_id`. **Never put a Supabase secret key or `service_role` key in a `VITE_` variable or in this frontend.**

## Cloudflare Pages alternative

This project is a Vite static site. Use these build settings in Cloudflare Pages:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (the repository root)

### Automatic deploys from GitHub or GitLab

1. Push this project to a GitHub or GitLab repository. Include `package.json` and `package-lock.json`.
2. Sign in to Cloudflare and open **Workers & Pages**.
3. Select **Create application → Pages → Connect to Git** and authorize Cloudflare to access the repository.
4. Select the repository and configure the build settings above. Keep the production branch as `main` if that is the branch you use.
5. Select **Save and Deploy**. Cloudflare builds the app and publishes it at a `*.pages.dev` HTTPS address.
6. Open that address on your phone. You can add it to the home screen from the browser's share/menu options.

Future commits pushed to the connected production branch trigger a new deployment. Pull requests and other branches can receive preview deployments. Cloudflare currently does not let a Pages project created with Git integration switch later to Direct Upload; choose Git integration if you want automatic deployment from commits.

### Deploy the built files manually

If you prefer to upload a build yourself, run `npm install` and `npm run build` in the project folder, then create a **Direct Upload** Pages project and upload the generated `dist` directory. Select Direct Upload when creating the project: a Direct Upload project cannot later be converted to a Git-integrated project. You can also use Wrangler for repeated manual deployments.

Cloudflare's Vite guide uses `npm run build` and `dist` for the build settings. See the [Vite on Cloudflare Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/), [Git integration guide](https://developers.cloudflare.com/pages/configuration/git-integration/), and [build configuration reference](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Option A: Vercel (Git-based)
1. Create a GitHub repository and push this project to it.
2. Sign in to Vercel and choose **Add New → Project**, then import the repository.
3. Keep the detected Vite settings, or set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Select **Deploy**. Vercel will provide a public HTTPS URL such as `https://your-project.vercel.app`.
5. Open that URL on your phone. Save it to the home screen if you want quick access.

## Option B: Netlify Drop (quick publish)
1. In the project folder, run `npm install` and then `npm run build`.
2. Open Netlify and use its manual deploy / drag-and-drop flow to upload the generated `dist` folder.
3. Use the HTTPS URL Netlify provides from your phone or another device.

## Update the published site
For a Git-connected deployment, push commits to the linked branch; the host rebuilds and publishes automatically. For a manual deployment, build again and upload the new `dist` folder.

## Data and backups
With Supabase configured, transactions are stored in the database and are available on other devices after signing in with the same account. Without Supabase environment variables, the site stays in demo mode and saves data only in that browser's localStorage. The initial sample records are fictional demo data. Export CSV backups periodically; the current app does not import old browser-local records automatically.

The browser app uses only a Supabase publishable key (or legacy `anon` key) together with RLS. Never place a secret or `service_role` key in frontend environment variables.
