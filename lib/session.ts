import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/* User session regime — entirely separate from the device auth in
 * lib/device-auth.ts. httpOnly + Secure + SameSite=Lax cookie carrying a
 * signed (not encrypted — it holds no secrets, just IDs and a role) JWT.
 *
 * Uses `jose`, not a Node-only JWT library: middleware.ts runs on the Edge
 * runtime, where Node's `crypto` module (and argon2's native binding) is not
 * available. Verifying the session on every request in middleware — so
 * protected routes redirect before any page code runs — requires a verifier
 * that works there. Password hashing itself still happens with argon2, but
 * only inside route handlers (Node runtime), never in middleware.
 */

const COOKIE_NAME = "greengo_session";
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\"",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload =
  | { kind: "tenant"; userId: string; tenantId: string; name: string }
  | { kind: "admin"; userId: string; role: "SUPPORT" | "SUPER_ADMIN"; name: string };

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ONE_WEEK_SECONDS}s`)
    .sign(getSecret());
}

/** Verifies a raw token string — used by middleware, which cannot call
 *  next/headers' cookies(). Returns null rather than throwing on any
 *  failure (expired, tampered, wrong secret) so callers always get a plain
 *  "not authenticated" signal. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.kind === "tenant" && typeof payload.tenantId === "string") {
      return {
        kind: "tenant",
        userId: payload.userId as string,
        tenantId: payload.tenantId,
        name: payload.name as string,
      };
    }
    if (payload.kind === "admin") {
      return {
        kind: "admin",
        userId: payload.userId as string,
        role: payload.role as "SUPPORT" | "SUPER_ADMIN",
        name: payload.name as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Server Components / Route Handlers: reads the session from the request's
 *  cookie jar via next/headers. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
