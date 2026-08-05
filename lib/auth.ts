import argon2 from "argon2";
import { db } from "./db";

/* Login/claim helpers shared by the tenant and admin login routes.
 *
 * Two properties the brief calls out as easy to get wrong:
 *
 * 1. No tenant enumeration: wrong-password and no-such-account must produce
 *    an IDENTICAL response and take comparably long. If failed attempts were
 *    tracked on the User row, a non-existent phone number would skip the
 *    "increment attempts" write entirely — a fast path an attacker can time.
 *    LoginAttempt is keyed by the raw submitted identifier instead, so both
 *    cases hit the same table, the same delay math, the same argon2.verify
 *    call (against a real hash if the user exists, a dummy one if not).
 *
 * 2. Progressive delay, not lockout: a hard lockout triggered by repeated
 *    failed attempts is itself an attack — anyone who knows a farmer's phone
 *    number could lock them out of their own dashboard. Delay discourages
 *    brute force without ever refusing a correct password.
 */

const DELAY_SEQUENCE_SECONDS = [0, 1, 2, 5, 15, 30] as const;
const DELAY_CAP_SECONDS = 60;

export function delayForAttempt(attemptNumber: number): number {
  if (attemptNumber >= DELAY_SEQUENCE_SECONDS.length) return DELAY_CAP_SECONDS;
  return DELAY_SEQUENCE_SECONDS[attemptNumber]!;
}

/** A hash of a value nobody will ever type, so argon2.verify always runs a
 *  real computation (and takes real time) even when no user record exists. */
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$q7lIVw3zZ3iFQhk8/8y5rZoP9j0k9v3ZbG0G6h6f7bY";

/**
 * Records this attempt against `identifier`, sleeps for the progressive
 * delay BEFORE returning, and returns the attempt count so the caller can
 * decide (after verifying credentials) whether to reset it.
 */
export async function applyLoginDelay(identifier: string): Promise<number> {
  const record = await db.loginAttempt.upsert({
    where: { identifier },
    create: { identifier, attempts: 1, lastAttemptAt: new Date() },
    update: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
  });

  const delaySeconds = delayForAttempt(record.attempts - 1);
  if (delaySeconds > 0) {
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }
  return record.attempts;
}

export async function resetLoginAttempts(identifier: string): Promise<void> {
  await db.loginAttempt.updateMany({ where: { identifier }, data: { attempts: 0 } });
}

/** Runs a real argon2 verify even for a non-existent account, so response
 *  timing does not distinguish "wrong password" from "no such account". */
export async function verifyPasswordConstantPath(
  storedHash: string | null,
  candidate: string,
): Promise<boolean> {
  return argon2.verify(storedHash ?? DUMMY_HASH, candidate).catch(() => false);
}

/**
 * Normalises a Ghanaian phone number to E.164. Accepts local format
 * (0244123456), already-E.164 (+233244123456), or bare digits
 * (233244123456) — the three shapes the handoff's own inputs would produce.
 * Returns null if the result isn't a plausible Ghanaian mobile number, so
 * callers can reject bad input before ever touching the database.
 */
export function normalizePhoneE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  const countryCode = process.env.PHONE_COUNTRY_CODE ?? "233";

  let national: string;
  if (digits.startsWith("+")) {
    if (!digits.startsWith(`+${countryCode}`)) return null;
    national = digits.slice(1 + countryCode.length);
  } else if (digits.startsWith(countryCode) && digits.length > 9) {
    national = digits.slice(countryCode.length);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  if (!/^\d{9}$/.test(national)) return null;
  return `+${countryCode}${national}`;
}
