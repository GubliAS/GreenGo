import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/* POST /api/auth/claim-device — Add Device page: an already-authenticated
 * tenant claiming an additional greenhouse. Same atomic single-use
 * redemption as /api/auth/register, without the account-creation half. */

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : null;
  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing claim code." }, { status: 400 });
  }

  try {
    const device = await db.$transaction(async (tx) => {
      const now = new Date();

      const claimUpdate = await tx.claimCode.updateMany({
        where: { code, consumedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        data: { consumedAt: now, consumedByTenantId: session.tenantId },
      });
      if (claimUpdate.count !== 1) {
        throw new ClaimError("This code is no longer available. Refresh and try again.");
      }

      const claimCode = await tx.claimCode.findUniqueOrThrow({ where: { code } });
      const device = await tx.device.update({
        where: { id: claimCode.deviceId },
        data: { tenantId: session.tenantId, claimedAt: now },
      });

      await tx.auditEntry.create({
        data: {
          actorUserId: session.userId,
          actorName: session.name,
          tenantId: session.tenantId,
          deviceId: device.id,
          action: "DEVICE_CLAIMED",
          details: `claimed device ${code} as "${device.label ?? device.mac}"`,
          createdAt: now,
        },
      });

      return device;
    });

    return NextResponse.json({ ok: true, deviceId: device.id, deviceLabel: device.label });
  } catch (e) {
    if (e instanceof ClaimError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
    }
    throw e;
  }
}

class ClaimError extends Error {}
