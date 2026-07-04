# Humble + y0 — Merged SaaS Deployment Status

This document records how the merged **y0 + Humble** SaaS is structured, what is
deployed, and the exact steps to finish making it fully live on Vercel.

## Architecture decision: one merged frontend

y0 and Humble are two rebrands of the **same Suna/Kortix codebase**. Rather than
run two divergent apps, the merged product uses a **single canonical frontend**:

> **`humble/apps/web` is the one true merged frontend.**

Why this app is the base:
- It is the **superset** — it already contains every dashboard route the y0
  frontend has (`dashboard`, `agents`, `admin`, `settings`, `projects`,
  `credits-explained`, …) **plus** more that y0 lacks (`browser`, `channels`,
  `connectors`, `commands`, `configuration`, `changelog`, instance routing,
  onboarding, templates, tunnel).
- It is the target of the Vercel project you provided
  (`prj_9zqL5ejzPusClT6JeTkCb6ER2eYr`, project name **humble**).
- It already carries the Humble rebrand and the y0 brand assets.

The two products are presented as tabs over this one app. `y0` and `Humble` are
the same underlying agent platform with two brand front-doors.

## What is deployed

| Item | State |
|---|---|
| Vercel project | `humble` (`prj_9zqL5ejzPusClT6JeTkCb6ER2eYr`), team `yethikrishnas-projects` |
| Root directory | `apps/web` |
| Framework | Next.js 15 (React 18) |
| Latest **production** (`main`) | Builds OK but **crashes at runtime** until the fix below reaches `main` |
| Latest **preview** (this branch) | `READY` — includes the runtime-crash fix |

### The bug that was fixed

Every request to the production deployment returned **HTTP 500
`MIDDLEWARE_INVOCATION_FAILED`**. Root cause (confirmed from Vercel runtime logs):

1. `src/lib/env-schema.ts` validated runtime env with a strict Zod `.parse()`,
   evaluated at module load via `export const env = getEnv()`. With
   `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `BACKEND_URL` unset, this threw at
   import time — taking down **every** route, including static marketing pages.
2. `src/middleware.ts` called `createServerClient(undefined, undefined, …)`,
   which throws `Your project's URL and Key are required`.

**Fix (this branch):** `parseRuntimeEnv` now uses `safeParse` with safe
fallbacks (never throws), and the middleware skips Supabase auth when the URL/key
are absent — public routes render, protected routes redirect to `/auth` as
usual. The public UI now renders with **no backend configured at all**.

## Steps to finish going fully live

### 1. Promote the fix to production
The fix is on branch `claude/saas-free-tier-vercel-1fp583`. The Vercel project
deploys `main`. Merge the branch into `main` (same as PR #3) and Vercel will
redeploy production automatically. Until then, production keeps serving the old
crashing build.

### 2. Set environment variables (for auth + dashboard)
The **public site renders without these**, but sign-in and the dashboard need a
Supabase project and a running backend. In the Vercel project → Settings →
Environment Variables, set (Production + Preview):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_URL` | Same Supabase URL (used server-side in middleware) |
| `SUPABASE_ANON_KEY` | Same anon key (server-side) |
| `NEXT_PUBLIC_BACKEND_URL` | Your backend API base URL, e.g. `https://api.yethikrishnar.pw/v1` |
| `BACKEND_URL` | Same backend URL (server-side) |
| `NEXT_PUBLIC_APP_URL` | Public site URL, e.g. `https://humble-gilt.vercel.app` |
| `NEXT_PUBLIC_ENV_MODE` | `cloud` |

The app also accepts `KORTIX_PUBLIC_*` equivalents; `NEXT_PUBLIC_*` is the
simplest on Vercel. The Python backend is **not** deployable on Vercel (long-
running FastAPI + Redis Streams worker) — host it separately (see
`docs/` and the y0 repo's `docs/VERCEL_FREE_TIER.md`) and point
`NEXT_PUBLIC_BACKEND_URL` at it.

### 3. Make the site publicly viewable
The project currently has **Vercel Deployment Protection (SSO)** enabled — all
deployment URLs return a `vercel.com/sso-api` login redirect, so the public
can't reach the site even though it works. To publish: Vercel project → Settings
→ Deployment Protection → turn off **Vercel Authentication** for Production (or
attach a production custom domain, which is exempt).

## Identity cleanup (this branch)

The first rebrand pass (product name + brand assets) left the **contact/social
identity layer** untouched, and in a few spots I had fabricated placeholder
URLs. That's fixed now, across both `humble/apps/web` and `y0/apps/frontend`:

- Removed **fabricated** social URLs I had written (`x.com/humble`,
  `linkedin.com/company/humble`, and pre-existing `x.com/y0_ai` /
  `linkedin.com/company/y0-ai` in y0) — replaced with the real accounts from
  your portfolio site (`x.com/yethikrishna_r`, `linkedin.com/in/yethikrishna-r-313530201`,
  `github.com/yethikrishna`).
- Removed the **stale Kortix Discord invite** and `status.kortix.com` link
  (not yours) from Humble's footer and help sidebar.
- Replaced all `info@kortix.com` / `support@kortix.com` / `hey@kortix.ai` /
  `security@kortix.com` contact emails with `yethikrishnarcvn7a@gmail.com`
  across the legal page, support page, enterprise page, countryerror page,
  global error page, and help/credits page.
- **Careers and Partnerships pages impersonated the original Kortix
  founder**: "I'm Marko", `marko@kortix.com`, `x.com/markokraemer`,
  `linkedin.com/in/markokraemer` — replaced with your identity. The
  Partnerships page also embedded a **live Cal.com booking widget pointed at
  his personal calendar** (`markokraemer/partnerships`) — removed entirely
  (no real booking link exists for you yet), CTA now goes to your email.
- Fixed the self-host install command on the homepage — it curled
  `kortix.com/install` (infra you don't control); now shows
  `git clone github.com/yethikrishna/humble`.
- Added a "Built by Yethikrishna R" footer credit linking to
  `founder.myndlabs.tech` on both apps' footers.
- Fixed broken/wrong GitHub links (`kortix-ai/suna`, `yethikrishna/y0-app`)
  to the real repos (`yethikrishna/humble`, `yethikrishna/y0`).

### Deliberately left alone — flagging for you
- **`src/app/legal/page.tsx`** defines `"Company"` as **"Kortix AI Corp, a
  Delaware corporation"**. That's a legal-entity claim, not branding — I did
  not invent a replacement entity/jurisdiction since I don't know your actual
  incorporation status. If Humble/y0 isn't operated by an actual "Kortix AI
  Corp", this Terms of Service is legally inaccurate and needs your own
  correction (or a lawyer's).
- **The desktop app's custom URL scheme is `kortix://`** (referenced in
  `src/app/auth/actions.ts` and `src/lib/utils/is-electron.ts` in both repos).
  This is a registered OS-level protocol handler owned by the Electron/desktop
  app build, which I did not touch — renaming just the web-side string would
  break desktop deep-linking without a matching change in `apps/desktop`.

## Still needs your input
- **Backend credentials** — I can't fabricate a Supabase project or backend URL.
  Provide them (step 2) to make auth/dashboard live.
- **"One single repo"** — y0 and Humble are still two Git repos. Truly fusing
  them into one repo requires creating a new empty repo to hold the merged
  history; that can't be done autonomously. The single *frontend* decision above
  stands regardless of which repo hosts it.
- **Legal entity name** in the Terms of Service (see above) — needs your
  decision, not a guess from me.
