import { z } from 'zod'

const RuntimeEnvSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL'),
  ENV_MODE: z.enum(['local', 'cloud']).default('local'),
  APP_URL: z.string().url('APP_URL must be a valid URL').default('http://localhost:3000'),
  /** Default sandbox container name — used as fallback before the store hydrates */
  SANDBOX_ID: z.string().optional().default('kortix-sandbox'),
})

export type RuntimeEnv = z.infer<typeof RuntimeEnvSchema>

// Fallback used when the backend/Supabase env vars are not (yet) configured.
// This lets the public marketing site render instead of crashing the whole app
// (middleware, static pages, everything) at module-load time. Any surface that
// actually needs a working backend should gate on `isRuntimeEnvConfigured()`
// and show a "not configured" state rather than assume these are real.
const FALLBACK_ENV: RuntimeEnv = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  BACKEND_URL: '',
  ENV_MODE: 'local',
  APP_URL: 'http://localhost:3000',
  SANDBOX_ID: 'kortix-sandbox',
}

/**
 * Parse runtime env WITHOUT throwing. Returns validated values when present,
 * or a safe fallback (with empty backend/Supabase values) when they are
 * missing. Never throwing here is important: `env-config` evaluates this at
 * module load, so a throw would take down every route — including static
 * marketing pages that don't need a backend at all.
 */
export function parseRuntimeEnv(raw: Partial<RuntimeEnv>): RuntimeEnv {
  const result = RuntimeEnvSchema.safeParse({
    ENV_MODE: 'local',
    ...raw,
  })
  if (result.success) {
    return result.data
  }
  // Merge whatever valid non-empty values we did get over the fallback so
  // partially-configured environments still surface what they can.
  return {
    ...FALLBACK_ENV,
    ...Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined && v !== ''),
    ),
  } as RuntimeEnv
}

/**
 * Strict validation for callers that want to know whether the backend/Supabase
 * are actually wired up (e.g. to gate the dashboard or show a setup notice).
 */
export function isRuntimeEnvConfigured(raw: Partial<RuntimeEnv>): boolean {
  return RuntimeEnvSchema.safeParse({ ENV_MODE: 'local', ...raw }).success
}
