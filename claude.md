# Healthfit.ai — Project Handoff & Setup Guide

This document provides complete setup and run instructions for the next AI or developer. It covers local development, ngrok tunneling, environment configuration, and all integrations.

---

## Project Overview

**Healthfit.ai** is a consumer wellness SaaS with:

- Next.js 16 (App Router) + React 19
- Supabase (auth, database, storage)
- Dodo Payments (subscriptions)
- Sanity CMS (blog, articles, guides)
- Drizzle ORM
- Google OAuth + email magic-link sign-in
- AI coach (OpenAI, optional)

**Key URLs when running locally with ngrok:**

| Purpose | URL |
|---------|-----|
| Local Next.js | `http://localhost:4001` |
| Public tunnel (ngrok) | `https://exotic-hen-really.ngrok-free.app` |
| ngrok inspector | `http://127.0.0.1:4040` |

---

## Prerequisites

- **Node.js** 20+
- **npm** (or pnpm/bun)
- **Supabase** account
- **Dodo Payments** account (test mode)
- **ngrok** — installed via Homebrew and configured with authtoken

---

## 1. ngrok Setup (Required for Local Dev)

The app uses ngrok to expose localhost for OAuth callbacks, Dodo checkout redirects, and magic links. A **static domain** is configured so the URL stays the same across restarts.

### Install ngrok

```bash
brew install ngrok
```

### Add authtoken

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### Static domain (free tier)

This project uses the static domain: **`exotic-hen-really.ngrok-free.app`**

- If this is your ngrok account’s default domain, no changes needed.
- If you have a different static domain, update it in `package.json`:
  - In the `dev` script: replace `exotic-hen-really.ngrok-free.app` with your domain
  - In the `ngrok` script: same replacement

### ngrok + dev server

`npm run dev` runs both Next.js and ngrok via `concurrently`:

- **Next.js** on port 4001
- **ngrok** tunneling port 4001 to `https://exotic-hen-really.ngrok-free.app`

ngrok is started with `--log stdout --log-format logfmt` so its output is visible in the terminal (the default TUI does not work well with `concurrently`).

---

## 2. Environment Variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

### Required variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (use ngrok when tunneling) | `https://exotic-hen-really.ngrok-free.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | |
| `DATABASE_URL` | Postgres connection string | `postgresql://...` |
| `DODO_PAYMENTS_API_KEY` | Dodo API key | |
| `DODO_WEBHOOK_SECRET` | Dodo webhook signing secret | |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` | `test_mode` |
| `DODO_STARTER_PRODUCT_ID` | Dodo product ID for Starter plan | |
| `DODO_PRO_PRODUCT_ID` | Dodo product ID for Pro plan | |
| `DODO_ELITE_PRODUCT_ID` | Dodo product ID for Elite plan | |

### When using ngrok

Set:

```
NEXT_PUBLIC_APP_URL=https://exotic-hen-really.ngrok-free.app
```

This is used for:

- Magic link redirects (`emailRedirectTo`)
- OAuth callback URLs
- Site metadata and canonical URLs

### Optional variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID for CMS |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (e.g. `production`) |
| `SANITY_REVALIDATE_SECRET` | Secret for Sanity webhook revalidation |
| `OPENAI_API_KEY` | For AI coach |
| `HEALTHFIT_AI_MODEL` | OpenAI model (e.g. `gpt-4o`) |
| `HEALTHFIT_ADMIN_EMAILS` | Comma-separated admin emails |

---

## 3. Supabase Configuration

### Database migration

Run the foundation migration:

```bash
# Using Supabase CLI (if linked)
supabase db push

# Or apply manually in Supabase SQL Editor
# File: supabase/migrations/202603170001_healthfit_foundation.sql
```

### Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

- **Site URL:** `https://exotic-hen-really.ngrok-free.app` (when using ngrok)
- **Redirect URLs:**  
  `https://exotic-hen-really.ngrok-free.app/**`  
  `http://localhost:4001/**`

### Storage buckets

Ensure these buckets exist (or are created by the migration):

- `avatars`
- `progress-photos`

---

## 4. Dodo Payments Configuration

### Webhook URL

The Dodo webhook is a **Supabase Edge Function**, not the Next.js app. Configure in Dodo Dashboard:

```
https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/dodo-webhook
```

Example: `https://wdmkrxkzkhscuxfqvqpw.supabase.co/functions/v1/dodo-webhook`

### Deploy the webhook

```bash
supabase login
npm run deploy:webhook
```

The function uses `--no-verify-jwt` because Dodo sends webhooks without a Supabase JWT.

### Webhook secret

Set `DODO_WEBHOOK_SECRET` in Supabase Edge Function secrets (Dashboard → Project Settings → Edge Functions → Secrets) to match the secret configured in the Dodo Dashboard.

---

## 5. Running the Application

### Full dev (Next.js + ngrok)

```bash
npm install
npm run dev
```

This starts:

1. **Next.js** at `http://localhost:4001`
2. **ngrok** tunnel at `https://exotic-hen-really.ngrok-free.app`

Use the ngrok URL for OAuth, magic links, and Dodo checkout flows.

### Server only (no ngrok)

```bash
npm run dev:server
```

Useful when you only need local access at `http://localhost:4001`.

### ngrok only

If the dev server is already running elsewhere:

```bash
npm run ngrok
```

---

## 6. npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js + ngrok (recommended for full local dev) |
| `npm run dev:server` | Next.js only on port 4001 |
| `npm run ngrok` | ngrok tunnel only |
| `npm run build` | Production build |
| `npm run start` | Production server on port 4001 |
| `npm run deploy:webhook` | Deploy Dodo webhook to Supabase |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |

---

## 7. Project Structure (Key Paths)

```
app/
  api/           # API routes (auth, coach, habits, etc.)
  checkout/      # Dodo checkout
  dashboard/     # Member dashboard
  login/         # Auth
  onboarding/    # Onboarding flow
  (studio)/      # Sanity Studio
components/
lib/             # Shared utilities, Supabase, Dodo client
supabase/
  functions/
    dodo-webhook/  # Dodo webhook Edge Function
  migrations/
actions/         # Server actions
tests/
  unit/
  e2e/
```

---

## 8. Common Issues & Fixes

### ERR_NGROK_3200 — Endpoint offline

- **Cause:** Old ngrok URL or ngrok not running.
- **Fix:** Run `npm run dev` and use the URL shown in the `[ngrok]` output. With the static domain, it should always be `https://exotic-hen-really.ngrok-free.app`.

### ERR_NGROK_108 — 1 simultaneous session limit

- **Cause:** Another ngrok process is already running.
- **Fix:** Stop other ngrok processes: `pkill -f ngrok`, then restart `npm run dev`.

### OAuth / magic link redirect fails

- **Cause:** Supabase redirect URLs or `NEXT_PUBLIC_APP_URL` mismatch.
- **Fix:** Ensure Supabase has `https://exotic-hen-really.ngrok-free.app/**` in Redirect URLs and `NEXT_PUBLIC_APP_URL` is set to that URL in `.env.local`.

### Dodo webhook not receiving events

- **Cause:** Wrong webhook URL or secret.
- **Fix:** Use the Supabase Edge Function URL (`.../functions/v1/dodo-webhook`), not the ngrok URL. Ensure `DODO_WEBHOOK_SECRET` matches the Dodo Dashboard.

### Port 4001 vs 3000

- The app runs on **port 4001**, not 3000.
- `.env.example` shows `localhost:3000`; for local-only dev without ngrok, use `http://localhost:4001`.

---

## 9. Verification Checklist

Before handing off, verify:

- [ ] `npm run dev` starts Next.js and ngrok
- [ ] `https://exotic-hen-really.ngrok-free.app` loads the app
- [ ] Magic link sign-in works (check `NEXT_PUBLIC_APP_URL`)
- [ ] Google OAuth works (Supabase redirect URLs)
- [ ] Dodo checkout flow works (return URL uses request origin)
- [ ] Webhook deployed: `npm run deploy:webhook`
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run test:e2e` passes (after `npx playwright install chromium`)

---

## 10. Handoff Notes for AI

- **Stack:** Next.js 16, React 19, Supabase, Dodo Payments, Sanity, Drizzle.
- **Port:** 4001 (not 3000).
- **ngrok:** Static domain `exotic-hen-really.ngrok-free.app`; required for OAuth and magic links when developing locally.
- **Webhook:** Hosted on Supabase Edge Functions; URL is `https://<project>.supabase.co/functions/v1/dodo-webhook`.
- **Auth:** Supabase Auth with Google OAuth and magic links; redirect URLs must include the ngrok URL when using it.
- **Checkout:** Dodo checkout uses `origin` from the request, so it works with ngrok when the app is accessed via the ngrok URL.
