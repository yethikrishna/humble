# y0 + Humble — True Single-Codebase Merge

This branch (`claude/true-merge-y0-humble`, based off
`claude/saas-free-tier-vercel-1fp583`) merges y0 and Humble into **one
deployable Next.js app** (`humble/apps/web`) that presents as either brand
depending on which hostname serves the request. One Vercel project, two
domains attached to it, one codebase — not two apps cross-linking each other.

## How it works

- `src/lib/brands/config.ts` defines two `Brand` objects (`y0Brand`,
  `humbleBrand`): name, title, description, keywords, hero copy, nav links,
  footer links, GitHub URL. `getBrandForHost(host)` matches the request's
  `Host` header against y0's known hostnames (`y0-app.vercel.app`,
  `y0.yethikrishnar.pw`, plus `NEXT_PUBLIC_Y0_HOSTNAMES` for custom domains)
  and falls back to Humble otherwise.
- `src/app/layout.tsx` reads the host via `next/headers` `headers()` (already
  forced into dynamic/per-request rendering by the pre-existing
  `await connection()` call — this adds no new static-vs-dynamic cost),
  resolves the brand server-side, and:
  - Uses it in `generateMetadata()` (title, description, OG/Twitter tags,
    canonical URL, JSON-LD) — replacing what used to be a static `metadata`
    export hardcoded to Humble.
  - Passes it into `<BrandProvider brand={brand}>`, a client React Context
    (`src/lib/brands/brand-provider.tsx`) so Client Components can call
    `useBrand()`.
  - Deleted a block of hardcoded duplicate `<meta>`/`<title>` tags that
    always said "Humble" regardless of host — it was fully redundant with
    `generateMetadata()`'s output and would have produced conflicting tags
    on y0's domain.
- **Brand-aware now**: root layout metadata/JSON-LD, the navbar (nav links,
  GitHub star count source repo, launch button label), the footer
  (copyright name, GitHub link), and the home page (`/`) hero — headline,
  "Launch Your {brand}" CTA, install command, and a few body copy mentions.

Verified by building and running the production server locally, hitting `/`
with `Host: humble.yethikrishnar.pw` vs `Host: y0-app.vercel.app` — title,
canonical URL, hero headline, footer copyright, and cross-brand nav link all
correctly differ per request.

## Deploying this as one true merge

1. In the Vercel project (`humble`, `prj_9zqL5ejzPusClT6JeTkCb6ER2eYr`), add
   **both** domains under Settings → Domains: your Humble domain and your y0
   domain (e.g. `y0-app.vercel.app` alias or a custom `y0.yourdomain.com`).
   Both now point at this one project/deployment.
2. You can then **decommission the separate y0 Vercel project** (if one
   exists) — this app serves both.
3. Set `NEXT_PUBLIC_Y0_APP_URL` / `NEXT_PUBLIC_HUMBLE_APP_URL` as before (used
   for the cross-brand nav link) and optionally `NEXT_PUBLIC_Y0_HOSTNAMES` if
   y0's real domain differs from the defaults baked into `config.ts`.

## Scope boundaries — what this merge does NOT do

**Backend functionality was never merged, because the two backends are
fundamentally different systems**, not two configs of one system:

| | y0 | Humble |
|---|---|---|
| Backend | Python / FastAPI (`y0/backend`) | TypeScript / Bun monolith `kortix-api` (`humble/apps/api`) |
| Data layer | Supabase (Postgres + GoTrue auth + PostgREST-style queries) | Its own router/repositories/queue/pool |
| Agent runtime | Custom Python agent loop | OpenCode |

Because of this, y0's dashboard features that have no equivalent in
Humble's backend — **agent builder (`/agents`), knowledge base
(`/knowledge`), library (`/library`), triggers (`/triggers`), and the
standalone thread view (`/thread/[id]`)** — were **not** ported into this
merged app. Porting the UI without the backend it depends on would produce
disconnected, non-functional pages, which is worse than not having them.
Making these available in the merged app is a real backend engineering
project (either implement them against `kortix-api`, or run both backends
and route by feature) — a decision for you to make, not something to fake.

The merged app's dashboard is Humble's feature set (which already has more
routes than y0's in most other respects: browser, channels, connectors,
commands, configuration, deployments, marketplace, memory, scheduled-tasks,
terminal, tools, tunnel, workspace).

**Not yet brand-aware** (still say "Humble" regardless of host, a smaller,
lower-visibility follow-up):
- Secondary marketing pages' body copy: `/about`, `/careers`,
  `/partnerships`, `/variant-2`, `/factory`, `/brand`, `/exploration`,
  `/tutorials`. The chrome around them (nav, footer, page `<title>`) is
  already correct; only the in-page prose still says "Humble".
- `/app` (mobile download QR page) always links to the Humble domain's
  `/app`, not the current brand's.
- `src/app/sitemap.ts` generates one sitemap for the default (Humble)
  domain only.

## Recommended follow-up

1. Attach y0's real domain to this Vercel project and delete/redirect the
   old standalone y0 deployment.
2. Decide on the backend question above — this determines what "one true
   merged frontend" can eventually mean for feature parity, not just brand
   chrome.
3. If desired, extend the same `useBrand()` pattern to the secondary
   marketing pages listed above.
