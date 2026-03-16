# Healthfit.ai

Healthfit.ai is a consumer wellness SaaS focused on workouts, nutrition, habits, AI coaching, and progress tracking. The app includes:

- a health-focused marketing site and legal pages
- Google OAuth and email magic-link sign-in
- protected onboarding with goal, schedule, nutrition, and wellness-consent capture
- a multi-section member dashboard for overview, coach, workouts, nutrition, habits, check-ins, progress, billing, and settings
- a lightweight admin console
- a richer Drizzle + Supabase schema for wellness and product data
- Dodo billing integration with internal entitlements
- AI coach endpoints with safety guardrails and fallback behavior
- Sanity-powered blog, article, news, and guide content sections
- unit and end-to-end smoke tests for the public experience

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the required Supabase and Dodo values.
3. Optionally add `OPENAI_API_KEY` and `HEALTHFIT_AI_MODEL` for live AI responses.
4. Install dependencies:

```bash
npm install
```

5. Apply the Supabase SQL migration in [`supabase/migrations/202603170001_healthfit_foundation.sql`](./supabase/migrations/202603170001_healthfit_foundation.sql).
6. Run the app:

```bash
npm run dev
```

## End-to-end testing

1. Install Playwright's Chromium browser once:

```bash
npx playwright install chromium
```

2. Run the E2E smoke suite:

```bash
npm run test:e2e
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

## Notes

- Healthfit.ai is implemented as a wellness product, not a medical or HIPAA-first clinical application.
- AI coaching is disabled automatically when the user does not have a paid entitlement or when AI env vars are missing.
- Billing product IDs should be mapped through `DODO_STARTER_PRODUCT_ID`, `DODO_PRO_PRODUCT_ID`, and `DODO_ELITE_PRODUCT_ID`.
