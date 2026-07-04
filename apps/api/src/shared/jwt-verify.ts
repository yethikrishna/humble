/**
 * Local JWT verification using Web Crypto API (no network roundtrip).
 *
 * Stack Auth (Neon Auth) JWTs are signed with ES256, RS256, or EdDSA
 * (Ed25519) depending on project configuration. We fetch the JWKS once at
 * startup and verify tokens locally — no call to the Stack Auth API per
 * request.
 *
 * Why: a REST call to fetch the current user makes a live HTTP roundtrip
 * every time. Local verification is also ~10x faster and doesn't depend on
 * Stack Auth's API being reachable for every single request.
 *
 * Fallback: if JWKS fetch fails (Stack Auth not reachable yet) or the key
 * is unknown, we fall back to the REST call so nothing breaks during cold
 * starts. See stack-auth.ts for that fallback.
 */

import { config } from '../config';

interface JwkKey {
  alg: string;
  crv?: string;
  kty: string;
  use?: string;
  kid: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
}

interface JwksResponse {
  keys: JwkKey[];
}

// ── JWKS cache ────────────────────────────────────────────────────────────────

/** kid → CryptoKey for fast lookup */
const keyCache = new Map<string, CryptoKey>();
let jwksFetchedAt = 0;
const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hour

function jwksUrl(): string | null {
  if (!config.STACK_PROJECT_ID) return null;
  return `${config.STACK_API_URL}/api/v1/projects/${config.STACK_PROJECT_ID}/.well-known/jwks.json`;
}

async function loadJwks(): Promise<void> {
  const url = jwksUrl();
  if (!url) return;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return;

    const jwks: JwksResponse = await res.json();

    for (const jwk of jwks.keys) {
      try {
        let algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams;

        if (jwk.alg === 'ES256' || (jwk.kty === 'EC' && jwk.crv === 'P-256')) {
          algorithm = { name: 'ECDSA', namedCurve: 'P-256' } as EcKeyImportParams;
        } else if (jwk.alg === 'RS256' || jwk.kty === 'RSA') {
          algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as RsaHashedImportParams;
        } else if (jwk.alg === 'EdDSA' || (jwk.kty === 'OKP' && jwk.crv === 'Ed25519')) {
          algorithm = { name: 'Ed25519' } as AlgorithmIdentifier;
        } else {
          continue; // Unknown algorithm — skip
        }

        const key = await crypto.subtle.importKey(
          'jwk',
          jwk as JsonWebKey,
          algorithm,
          false,
          ['verify'],
        );
        keyCache.set(jwk.kid, key);
      } catch {
        // Skip malformed keys, or keys whose algorithm this runtime's Web
        // Crypto implementation doesn't support (e.g. older Ed25519 support)
      }
    }

    jwksFetchedAt = Date.now();
  } catch {
    // Stack Auth not reachable yet — will retry on next auth check
  }
}

async function ensureKeys(): Promise<void> {
  if (keyCache.size > 0 && Date.now() - jwksFetchedAt < JWKS_TTL_MS) return;
  await loadJwks();
}

// ── JWT parsing ───────────────────────────────────────────────────────────────

function base64urlToBytes(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padding));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
  iss?: string;
  aud?: string | string[];
  role?: string;
  primaryEmail?: string;
  aal?: string;
  session_id?: string;
  is_anonymous?: boolean;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

interface JwtHeader {
  alg: string;
  kid?: string;
  typ?: string;
}

interface VerifyResult {
  ok: true;
  userId: string;
  email: string;
  payload: JwtPayload;
}

interface VerifyFailure {
  ok: false;
  reason: string;
}

/**
 * Verify a Stack Auth (Neon Auth) JWT locally using cached JWKS.
 *
 * Returns `{ ok: false, reason: 'no-keys' }` when JWKS is unavailable —
 * callers should fall back to the REST getCurrentUser() call in that case.
 */
export async function verifyStackAuthJwt(token: string): Promise<VerifyResult | VerifyFailure> {
  await ensureKeys();

  if (keyCache.size === 0) {
    return { ok: false, reason: 'no-keys' };
  }

  // Split the JWT
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, reason: 'malformed' };
  }

  const [headerB64, payloadB64, sigB64] = parts;

  // Parse header to find the right key
  let header: JwtHeader;
  try {
    header = JSON.parse(new TextDecoder().decode(base64urlToBytes(headerB64)));
  } catch {
    return { ok: false, reason: 'bad-header' };
  }

  // Look up key — by kid if present, otherwise first key
  let key: CryptoKey | undefined;
  if (header.kid) {
    key = keyCache.get(header.kid);
    if (!key) {
      // Unknown kid — JWKS may have rotated, try refreshing once
      await loadJwks();
      key = keyCache.get(header.kid);
    }
  } else {
    key = keyCache.values().next().value;
  }

  if (!key) {
    return { ok: false, reason: 'no-key-for-kid' };
  }

  // Determine verify algorithm from header
  let algorithm: AlgorithmIdentifier | EcdsaParams | RsaPssParams;
  if (header.alg === 'ES256') {
    algorithm = { name: 'ECDSA', hash: 'SHA-256' } as EcdsaParams;
  } else if (header.alg === 'RS256') {
    algorithm = { name: 'RSASSA-PKCS1-v1_5' };
  } else if (header.alg === 'EdDSA') {
    algorithm = { name: 'Ed25519' };
  } else {
    return { ok: false, reason: `unsupported-alg:${header.alg}` };
  }

  // Verify signature
  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlToBytes(sigB64) as unknown as BufferSource;

  try {
    const valid = await crypto.subtle.verify(algorithm, key, signature, signingInput);
    if (!valid) {
      return { ok: false, reason: 'bad-signature' };
    }
  } catch {
    return { ok: false, reason: 'verify-error' };
  }

  // Parse and validate payload
  let payload: JwtPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)));
  } catch {
    return { ok: false, reason: 'bad-payload' };
  }

  // Check expiry
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return { ok: false, reason: 'expired' };
  }

  // Require a subject (user id)
  if (!payload.sub) {
    return { ok: false, reason: 'no-sub' };
  }

  return {
    ok: true,
    userId: payload.sub,
    email: payload.email || payload.primaryEmail || (payload.user_metadata?.email as string) || '',
    payload,
  };
}

// ── Eager JWKS load on import ─────────────────────────────────────────────────
// Start fetching immediately so keys are ready before the first request.
loadJwks().catch(() => {});
