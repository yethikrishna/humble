import { config } from '../config';

export interface StackAuthUser {
  id: string;
  email: string;
}

/**
 * Fallback path when local JWT verification (jwt-verify.ts) can't be used
 * yet (JWKS not loaded, or an unrecognized kid). Calls Stack Auth's REST
 * API directly with the secret server key, matching the pattern Stack Auth
 * documents for server-side token verification:
 *   GET {STACK_API_URL}/api/v1/users/me
 *   x-stack-access-type: server
 *   x-stack-project-id: <project id>
 *   x-stack-secret-server-key: <secret key>
 *   x-stack-access-token: <the token being verified>
 *
 * Returns null for any invalid/expired token or network failure — callers
 * should treat that as "unauthenticated", not distinguish the reason.
 */
export async function getCurrentStackAuthUser(token: string): Promise<StackAuthUser | null> {
  if (!isStackAuthConfigured()) return null;

  try {
    const res = await fetch(`${config.STACK_API_URL}/api/v1/users/me`, {
      headers: {
        'x-stack-access-type': 'server',
        'x-stack-project-id': config.STACK_PROJECT_ID,
        'x-stack-secret-server-key': config.STACK_SECRET_SERVER_KEY,
        'x-stack-access-token': token,
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) return null;

    const user = await res.json();
    const id = user?.id;
    if (!id || typeof id !== 'string') return null;

    return {
      id,
      email: user?.primary_email || user?.primaryEmail || '',
    };
  } catch {
    return null;
  }
}

/**
 * Check if Stack Auth is configured (needed for JWT auth).
 */
export function isStackAuthConfigured(): boolean {
  return !!(config.STACK_PROJECT_ID && config.STACK_SECRET_SERVER_KEY);
}

function serverHeaders(): Record<string, string> {
  return {
    'x-stack-access-type': 'server',
    'x-stack-project-id': config.STACK_PROJECT_ID,
    'x-stack-secret-server-key': config.STACK_SECRET_SERVER_KEY,
    'content-type': 'application/json',
  };
}

/**
 * Server-side admin lookup by user id. Used where callers previously used
 * `supabase.auth.admin.getUserById(id)` (email notifications, OAuth userinfo).
 */
export async function getStackAuthUserById(userId: string): Promise<StackAuthUser | null> {
  if (!isStackAuthConfigured()) return null;

  try {
    const res = await fetch(`${config.STACK_API_URL}/api/v1/users/${encodeURIComponent(userId)}`, {
      headers: serverHeaders(),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;

    const user = await res.json();
    const id = user?.id;
    if (!id || typeof id !== 'string') return null;

    return {
      id,
      email: user?.primary_email || user?.primaryEmail || '',
    };
  } catch {
    return null;
  }
}

/**
 * List users (server admin). Used by the self-hosted bootstrap-owner flow to
 * check whether an owner account already exists.
 */
export async function listStackAuthUsers(opts: { limit?: number } = {}): Promise<StackAuthUser[]> {
  if (!isStackAuthConfigured()) return [];

  try {
    const url = new URL(`${config.STACK_API_URL}/api/v1/users`);
    url.searchParams.set('limit', String(opts.limit ?? 1));

    const res = await fetch(url.toString(), {
      headers: serverHeaders(),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return [];

    const body = await res.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    return items
      .map((u: any) => ({ id: u?.id, email: u?.primary_email || u?.primaryEmail || '' }))
      .filter((u: StackAuthUser) => !!u.id);
  } catch {
    return [];
  }
}

/**
 * Create a user (server admin) with an email/password credential.
 * Used by the self-hosted bootstrap-owner flow.
 */
export async function createStackAuthUser(opts: {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}): Promise<StackAuthUser | null> {
  if (!isStackAuthConfigured()) return null;

  try {
    const res = await fetch(`${config.STACK_API_URL}/api/v1/users`, {
      method: 'POST',
      headers: serverHeaders(),
      body: JSON.stringify({
        primary_email: opts.email,
        primary_email_auth_enabled: true,
        primary_email_verified: true,
        password: opts.password,
        server_metadata: opts.metadata ?? {},
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;

    const user = await res.json();
    const id = user?.id;
    if (!id || typeof id !== 'string') return null;

    return { id, email: user?.primary_email || opts.email };
  } catch {
    return null;
  }
}

/**
 * Reset a user's password / mark their email verified (server admin).
 * Used by the self-hosted bootstrap-owner flow to reset owner credentials.
 */
export async function updateStackAuthUserPassword(
  userId: string,
  password: string,
): Promise<boolean> {
  if (!isStackAuthConfigured()) return false;

  try {
    const res = await fetch(`${config.STACK_API_URL}/api/v1/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: serverHeaders(),
      body: JSON.stringify({ password, primary_email_verified: true }),
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
