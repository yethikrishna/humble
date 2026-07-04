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

**To migrate the database (I can't run this myself — see "why" below — so
these are exact commands for you to run):**

1. Create a Neon project (free tier) — via the Neon dashboard, or
   `vercel install neon` from this repo's Vercel project.

2. **One thing the migrations need that a fresh Neon database doesn't have
   by default**: `supabase/migrations/00000000000000_bootstrap.sql`,
   `00000000000001_table_grants.sql`, `00000000000010_access_control.sql`,
   `00000000000013_platform_user_roles.sql`, and
   `00000000000018_channel_tables.sql` grant privileges to three
   Supabase-convention Postgres roles (`service_role`, `authenticated`,
   `anon`) that Supabase auto-creates in every project for PostgREST's
   per-request role-switching. `kortix-api` doesn't use that mechanism (it
   connects as a single Postgres user via `drizzle-orm`/`postgres.js`), so
   these roles aren't functionally needed — but the `GRANT` statements will
   fail with `role "service_role" does not exist` on a vanilla Neon database
   unless the roles exist first. Create them (no login, just grant targets)
   before applying anything else:

   ```sql
   CREATE ROLE service_role NOLOGIN;
   CREATE ROLE authenticated NOLOGIN;
   CREATE ROLE anon NOLOGIN;
   ```

3. Apply the 24 migration files in `supabase/migrations/` **in filename
   order** (they're numbered, so a simple sorted glob is correct):

   ```bash
   for f in supabase/migrations/*.sql; do
     echo "Applying $f..."
     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || { echo "FAILED at $f"; break; }
   done
   ```

   Use your Neon connection string (the pooled one, with `?sslmode=require`)
   as `DATABASE_URL` for this.

4. Set `DATABASE_URL` in `apps/api`'s environment (Vercel project settings,
   or your backend host's env) to the same Neon connection string.

No application code changes are needed for this part — `kortix-api` already
reads a plain `DATABASE_URL`.

### Why I can't run this myself

I tried, from this sandboxed session: a direct `psql` connection to Neon's
Postgres port hung until timeout (this environment only allows outbound
HTTP(S) to an allowlisted set of hosts — raw Postgres wire protocol on port
5432 isn't one of them), and Neon's HTTP-based serverless driver
(`@neondatabase/serverless`) returned `403: Host not in allowlist` for
Neon's own API domain. Both the database and Stack Auth's servers are
unreachable from here by any method — which is also why the auth migration
below needs your testing, not mine.

## Auth: the part that isn't "just Neon"

`kortix-api` hard-requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
(`src/config.ts` line 68-72 — both `z.string().min(1, '... is required')`,
not optional). It uses them for:
- Verifying user JWTs locally via JWKS (`src/shared/jwt-verify.ts`) — falls
  back to a live `supabase.auth.getUser()` call if JWKS lookup misses.
- A Supabase client for the same purpose plus a couple of RPC calls
  (`src/shared/supabase.ts`).

The frontend (`apps/web`) also talks to Supabase Auth directly for
login/session (`@supabase/ssr`, `createServerClient` in `middleware.ts`).

This is the real dependency: not the database, but Supabase's auth service
(signup, login, magic links, JWT issuance).

### Status: using Neon Auth (Stack Auth) instead of self-hosting GoTrue

The account this project uses already has **Neon Auth** provisioned (built
on Stack Auth) rather than the self-hosted-GoTrue path this document
originally recommended as lowest-risk. Installing the real
`@stackframe/stack` SDK and reading its actual type definitions (not just
docs/search) confirmed something material: **its sign-in/sign-up/magic-link
methods only exist on the client-side app** (`useStackApp()`, called from
the browser) — `StackServerApp` (the secret-key-backed server API) only
does admin operations (list/create users, teams), not driving a login flow.

That means migrating isn't a drop-in swap like self-hosted GoTrue would
have been — it's a real restructuring of `apps/web/src/app/auth/actions.ts`
(13 Next.js Server Actions: password login/signup, magic link, OTP code,
password reset, Google OAuth, self-hosted installer, sign out) from
server-side calls to client-side `useStackApp()` calls, plus rewriting
`kortix-api`'s JWT verification to point at Stack Auth's JWKS endpoint
instead of Supabase's, and replacing the two Supabase RPC calls
(`atomic_use_credits`, `atomic_add_credits`) with direct calls through
`kortix-api`'s existing `drizzle`/`postgres` connection (those functions
are plain Postgres functions, unrelated to auth — see the database section
above).

This migration is real, sizeable, security-critical, and **completely
untestable from this session** — see "Why I can't run this myself" above,
which applies equally to Stack Auth's servers. Paused pending an explicit
scope decision (full migration of all 13 flows vs. core flows only) rather
than shipped half-verified.

## What's not done here

- Neon database: schema not yet applied (network-blocked from here — see
  above); apply it yourself with the commands in this doc.
- Auth: no code written yet. Once scope is confirmed, the migration will
  land on its own clearly-labeled branch so it can be tested in a Vercel
  preview before touching production — auth is the one subsystem where
  "ship it and see" isn't an acceptable way to find out it's broken.
