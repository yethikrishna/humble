# Moving off Supabase: Neon for the database, self-hosted auth

You asked whether Vercel now has its own auth/DB service to make this easy.
Checked against current Vercel docs: **no** — Vercel has no native auth
product. It has a *marketplace* with native integrations (`vercel install
neon` provisions Postgres, `vercel install upstash` provisions Redis), but
none of them include a bundled user-auth service. Neon is a database only.

The good news, found by actually reading the code rather than assuming: the
answer is different for each part of this app, and the database half really
is close to "easy."

## The database: already portable, near-zero work

`humble/apps/api` (`kortix-api`, the backend behind the merged app) does
**not** use Supabase's PostgREST-style client for its data — it connects to
Postgres directly via a plain `DATABASE_URL`, using `drizzle-orm` + the
`postgres` npm package (see `src/config.ts` line 65, `src/ensure-schema.ts`).
That's exactly how you'd connect to Neon.

The credit-system SQL functions it calls (`atomic_use_credits`,
`atomic_add_credits`, etc., in `supabase/migrations/*.sql`) are plain
`plpgsql` — checked all of them for Supabase-proprietary features
(`auth.uid()`, RLS tied to Supabase's `auth` schema, Supabase-only
extensions): **none found**. They're portable to any Postgres, Neon
included, unmodified.

**To migrate the database:**
1. Create a Neon project (free tier) — via the Neon dashboard, or from this
   repo's Vercel project: `vercel install neon`.
2. Apply the schema: run the SQL files in `supabase/migrations/` against
   the Neon connection string, in filename order (they're already
   numbered).
3. Set `DATABASE_URL` on `kortix-api` to the Neon connection string.

No application code changes required for this part.

## Auth: the part that isn't "just Neon"

`kortix-api` still hard-requires `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` (`src/config.ts` line 68-72 — both
`z.string().min(1, '... is required')`, not optional). It uses them for:
- Verifying user JWTs locally via JWKS (`src/shared/jwt-verify.ts`) — falls
  back to a live `supabase.auth.getUser()` call if JWKS lookup misses.
- A Supabase client for the same purpose plus a couple of RPC calls
  (`src/shared/supabase.ts`).

The frontend (`apps/web`) also talks to Supabase Auth directly for
login/session (`@supabase/ssr`, `createServerClient` in `middleware.ts`).

This is the real dependency: not the database, but Supabase's **GoTrue**
auth service (signup, login, magic links, JWT issuance). Two ways to remove
it, in order of how much code changes:

### Option A (recommended): self-host GoTrue against Neon

Supabase's auth server, **GoTrue**, is open source
(`supabase/gotrue` Docker image) and speaks the exact same JWT/JWKS format
this codebase already expects. Point it at your Neon database instead of a
Supabase-hosted one, and set `SUPABASE_URL` to your self-hosted GoTrue
endpoint. **Zero changes to `kortix-api` or `apps/web`** — they already
speak this protocol.

```bash
docker run -d --name gotrue \
  -e GOTRUE_DB_DRIVER=postgres \
  -e GOTRUE_DB_DATABASE_URL="<your Neon connection string>" \
  -e GOTRUE_SITE_URL="https://humble.yethikrishnar.pw" \
  -e GOTRUE_JWT_SECRET="<generate a long random secret>" \
  -e GOTRUE_JWT_EXP=3600 \
  -e GOTRUE_MAILER_AUTOCONFIRM=false \
  -e API_EXTERNAL_URL="https://auth.yourdomain.com" \
  -p 9999:9999 \
  supabase/gotrue:latest
```

Then: `SUPABASE_URL=https://auth.yourdomain.com`,
`SUPABASE_SERVICE_ROLE_KEY=<a JWT signed with GOTRUE_JWT_SECRET, role=service_role>`.
This runs alongside the existing `kortix-api` + worker host (the same
always-free VM discussed in `y0/docs/VERCEL_FREE_TIER.md` for the Python
backend) — one more small container, not a new class of infrastructure.

### Option B: migrate to a managed auth provider (e.g. Clerk)

Clerk has a generous free tier (10k MAU) and issues JWTs verifiable via
JWKS — the same shape `jwt-verify.ts` already expects, so that file adapts
with a changed JWKS URL rather than a rewrite. This needs real code changes
though: `src/shared/supabase.ts`'s RPC calls, the frontend's
`@supabase/ssr` login/session flow, and email/magic-link handling would all
move to Clerk's SDK. More work, no self-hosted infra.

## Recommendation

Option A. It's a config change plus one small container, not an
application rewrite, and keeps every line of existing auth-handling code
working as-is. Option B is the right call only if you specifically want a
managed auth dashboard/UI rather than owning the auth server yourself.

## What's not done here

I haven't provisioned a Neon database, generated JWT secrets, or stood up
GoTrue — that needs your Neon account and a host to run the auth container
on (same constraint as the Python backend in the free-tier guide: Vercel
can't run either). This document is the runbook; the actual provisioning
is a "give me the Neon connection string and I'll wire it in" follow-up
once you've created the project.
