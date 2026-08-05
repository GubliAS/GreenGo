import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhoneE164, applyLoginDelay, resetLoginAttempts, verifyPasswordConstantPath } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

/* POST /api/auth/login — tenant login. Phone number, never email (the
 * handoff is explicit: SMS is the alert channel, so phone is the identity).
 *
 * Identical response and timing for "wrong password" and "no such account":
 * both paths normalise the phone, apply the SAME progressive delay keyed to
 * the raw identifier, run a REAL argon2.verify either way (against the
 * user's hash, or a dummy one), and return the exact same generic message.
 * The only difference an attacker could observe is normalizePhoneE164()
 * itself rejecting obviously-malformed input before any of that — which
 * leaks nothing about which numbers have accounts, only which strings are
 * shaped like Ghanaian phone numbers.
 */

const GENERIC_ERROR = "Incorrect phone number or password.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawPhone = typeof body?.phone === "string" ? body.phone : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!rawPhone || !password) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const phoneE164 = normalizePhoneE164(rawPhone);
  const identifier = phoneE164 ?? `unnormalised:${rawPhone}`;

  await applyLoginDelay(identifier);

  const user = phoneE164
    ? await db.user.findUnique({ where: { phoneE164 }, include: { tenant: true } })
    : null;

  const valid =
    user?.role === "TENANT" &&
    (await verifyPasswordConstantPath(user.passwordHash, password));

  await logAttempt({
    actorUserId: user?.id ?? null,
    actorName: user?.name ?? "Unknown",
    tenantId: user?.tenantId ?? null,
    success: !!valid,
    identifier,
  });

  if (!valid || !user || !user.tenantId) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
  }

  await resetLoginAttempts(identifier);
  await setSessionCookie({ kind: "tenant", userId: user.id, tenantId: user.tenantId, name: user.name });

  return NextResponse.json({ ok: true });
}

async function logAttempt({
  actorUserId,
  actorName,
  tenantId,
  success,
  identifier,
}: {
  actorUserId: string | null;
  actorName: string;
  tenantId: string | null;
  success: boolean;
  identifier: string;
}) {
  await db.auditEntry.create({
    data: {
      actorUserId,
      actorName,
      tenantId,
      action: success ? "LOGIN_SUCCESS" : "LOGIN_FAILURE",
      details: success ? "Tenant login" : `Failed login attempt for ${identifier}`,
    },
  });
}
