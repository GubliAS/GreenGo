import { NextResponse } from "next/server";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { ensureDeviceAlertSetup } from "@/lib/device-defaults";

/* POST /api/auth/register — the Login page's claim flow, "details" step
 * onward: a brand-new tenant claiming their first device.
 *
 * Claim code redemption is atomic: the updateMany's WHERE clause only
 * matches an UNCONSUMED, UNEXPIRED code, so two concurrent requests for the
 * same code can both attempt this update, but at most one will find
 * `count === 1` — the classic check-and-set-in-one-statement pattern that
 * avoids a read-then-write race. Everything after that check runs inside
 * the same transaction, so a failure partway through (e.g. the phone number
 * turns out to be taken) rolls the claim back too.
 *
 * OTP verification remains client-side (1234/9999, matching the Login
 * page's existing behaviour) — this endpoint is called once the client has
 * already accepted an OTP. Real SMS-delivered OTP storage/verification is a
 * scoped-out simplification, not silently dropped; see DEVIATIONS.md. The
 * phone number is still normalised and checked for uniqueness here
 * regardless of the OTP step's fidelity.
 */

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : null;
  const name = typeof body?.name === "string" ? body.name.trim() : null;
  const rawPhone = typeof body?.phone === "string" ? body.phone : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!code || !name || !rawPhone || !password) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const phoneE164 = normalizePhoneE164(rawPhone);
  if (!phoneE164) {
    return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date();

      const claimUpdate = await tx.claimCode.updateMany({
        where: { code, consumedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        data: { consumedAt: now },
      });
      if (claimUpdate.count !== 1) {
        throw new ClaimError("This code is no longer available. Refresh and try again.");
      }

      const claimCode = await tx.claimCode.findUniqueOrThrow({ where: { code } });

      const existingUser = await tx.user.findUnique({ where: { phoneE164 } });
      if (existingUser) {
        throw new ClaimError("An account with this phone number already exists.");
      }

      const tenant = await tx.tenant.create({
        data: { name, phoneE164, createdAt: now },
      });

      await tx.claimCode.update({
        where: { code },
        data: { consumedByTenantId: tenant.id },
      });

      const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          phoneE164,
          passwordHash,
          role: "TENANT",
          phoneVerifiedAt: now,
        },
      });

      const device = await tx.device.update({
        where: { id: claimCode.deviceId },
        data: { tenantId: tenant.id, claimedAt: now },
      });

      await tx.auditEntry.create({
        data: {
          actorUserId: user.id,
          actorName: user.name,
          tenantId: tenant.id,
          deviceId: device.id,
          action: "DEVICE_CLAIMED",
          details: `claimed device ${code} as "${device.label ?? device.mac}"`,
          createdAt: now,
        },
      });

      await ensureDeviceAlertSetup(device.id, tenant.id, tx);

      return { user, tenant, device };
    });

    await setSessionCookie({
      kind: "tenant",
      userId: result.user.id,
      tenantId: result.tenant.id,
      name: result.user.name,
    });

    return NextResponse.json({ ok: true, deviceId: result.device.id, deviceLabel: result.device.label });
  } catch (e) {
    if (e instanceof ClaimError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
    }
    throw e;
  }
}

class ClaimError extends Error {}
