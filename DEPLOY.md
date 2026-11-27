# Deploying NimitTech Assets to Vercel

Two Vercel projects from this one repository:

| Project | Root Directory | What it is |
|---|---|---|
| `nimittech-assets-api` | `backend` | Express + better-auth + Prisma, one Vercel Function (Vercel detects Express from `src/app.js`) |
| `nimittech-assets` | `frontend` | The Vite single-page app (static files) |

The browser only ever talks to the **frontend** domain. Every `/api/*` request there goes to a small Vercel Function (`frontend/api/proxy.js`), which forwards it to the backend named by the `BACKEND_URL` environment variable, the same way the Vite dev proxy does locally. That keeps the login cookie first-party on the frontend domain, so sign-in works in every browser without cross-site cookie settings.

```
browser ──► https://nimittech-assets.vercel.app            (static app)
        └─► https://nimittech-assets.vercel.app/api/...    ──api/proxy.js──►  ${BACKEND_URL}/api/...
```

## 1. Database

Use a hosted Postgres reachable from Vercel (Prisma Postgres, Neon, Supabase…). For production traffic from serverless functions, use the provider's **pooled** connection string.

Apply the migrations once from your machine, pointing at the production database:

```bash
cd backend
DATABASE_URL="<production connection string>" npm run db:deploy
```

Re-run it whenever you add a migration.

## 2. Backend project

1. Vercel → **Add New… → Project** → import this repo.
2. **Root Directory:** `backend`. Framework Preset: **Express** (detected automatically).
3. **Environment Variables** (Production, and Preview if you use it):

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | production Postgres connection string |
   | `BETTER_AUTH_SECRET` | a new random 32+ character string (`npx @better-auth/cli secret`), not the dev one |
   | `BETTER_AUTH_URL` | the **frontend** URL, e.g. `https://nimittech-assets.vercel.app` |
   | `CORS_ORIGIN` | the **frontend** URL (comma-separate several, e.g. a custom domain too) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional SSO |
   | `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` / `MICROSOFT_TENANT_ID` | optional SSO |
   | `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_ACCOUNTS_URL` | optional SSO |

4. Deploy. Check `https://<backend>.vercel.app/health` returns `{"status":"OK"}`.

How the build works: `npm install` runs `postinstall` → `prisma generate` and then `scripts/compile-prisma-client.mjs`, which turns Prisma's generated TypeScript client into plain JavaScript. The function therefore runs on any Node version without TypeScript support.

## 3. Frontend project

1. Vercel → **Add New… → Project** → import the same repo.
2. **Root Directory:** `frontend`. Framework Preset: **Vite**.
3. **Environment Variables:** `BACKEND_URL` = the backend's URL, e.g. `https://asset-backend-xi.vercel.app` (no trailing slash).
4. Deploy. `https://<frontend>/api/health` should return `{"status":"ok",...}`.

Locally the same variable lives in `frontend/.env` (copy `frontend/.env.example`); the Vite dev proxy reads it.

## 4. Single sign-on redirect URLs

Register these with each provider, using the **frontend** domain (the one in `BETTER_AUTH_URL`):

- Google Cloud Console → Authorized redirect URIs: `https://<frontend>/api/auth/callback/google`
  (and Authorized JavaScript origin: `https://<frontend>`)
- Microsoft Entra → App registration → Redirect URIs (Web): `https://<frontend>/api/auth/callback/microsoft`
- Zoho API Console → Authorized Redirect URIs: `https://<frontend>/api/auth/callback/zoho`

Keep the `http://localhost:5173/...` ones too if you still sign in locally.

## 5. Check it

1. Open the frontend URL and create an account or sign in. You should land on `/dashboard`.
2. Reload the page; you should still be signed in (the cookie was set on the frontend domain).
3. Try Google / Zoho sign-in.

## Notes

- **Custom domain:** add it to the frontend project, then update `BETTER_AUTH_URL`, `CORS_ORIGIN` and the SSO redirect URLs to the new domain.
- **Preview deployments** get their own URLs. Sign-in on a preview only works if that URL is in `CORS_ORIGIN` and `BETTER_AUTH_URL` points at it. Simplest: test auth on production or on a fixed preview alias.
- **Create the first admin** against the production database: `cd backend && DATABASE_URL="<prod>" npm run create-admin`.
- **Local development is unchanged:** `npm run dev` in `backend` and in `frontend`.
