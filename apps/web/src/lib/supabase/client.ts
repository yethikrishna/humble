import { createBrowserClient } from '@supabase/ssr'
import { KORTIX_SUPABASE_AUTH_COOKIE } from './constants'
import { getEnv } from '@/lib/env-config'

export function createClient() {
  const runtimeEnv = getEnv()
  const url = runtimeEnv.SUPABASE_URL
  const key = runtimeEnv.SUPABASE_ANON_KEY

  if (!url || !key) {
    // No backend configured yet. Fall back to a placeholder client instead
    // of throwing — every page mounts AuthProvider, which calls this, so
    // throwing here took down the entire app (client-side "System Fault").
    // Auth-dependent calls will simply fail against this placeholder host
    // until real Supabase env vars are set; the public UI keeps rendering.
    return createBrowserClient('https://placeholder.invalid', 'placeholder-anon-key', {
      cookieOptions: {
        name: KORTIX_SUPABASE_AUTH_COOKIE,
        path: '/',
        sameSite: 'lax',
      },
    })
  }

  return createBrowserClient(url, key, {
    cookieOptions: {
      name: KORTIX_SUPABASE_AUTH_COOKIE,
      path: '/',
      sameSite: 'lax',
    },
  })
}
