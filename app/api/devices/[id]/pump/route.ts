import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  issuePumpCommand,
  ManualModeError,
  CooldownError,
  DailyCapError,
  DeviceDisabledError,
} from "@/lib/commands";

/* POST /api/devices/[id]/pump — the tenant dashboard's pump toggle. Tenant
 * sessions only: the handoff's admin Live Snapshot tab is a read-only demo
 * state switcher, not a real control, so no admin pump endpoint is built
 * here — that would be inventing a control the design never specifies.
 *
 * tenantId comes from the session, never from the URL or body: ownership is
 * checked by comparing the device's OWN tenantId (looked up server-side)
 * against session.tenantId, not by trusting a tenantId the client could send.
 */

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (action !== "PUMP_ON" && action !== "PUMP_OFF") {
    return NextResponse.json({ ok: false, error: "action must be PUMP_ON or PUMP_OFF." }, { status: 400 });
  }

  const device = await db.device.findUnique({ where: { id } });
  if (!device || device.tenantId !== session.tenantId) {
    // Same 404 whether the device doesn't exist or belongs to someone else —
    // don't confirm device IDs belong to other tenants.
    return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 });
  }

  try {
    const now = new Date();
    const command = await issuePumpCommand({
      device,
      tenantId: session.tenantId,
      action,
      actor: { kind: "USER", userId: session.userId, name: session.name },
      now,
    });

    await db.auditEntry.create({
      data: {
        actorUserId: session.userId,
        actorName: session.name,
        tenantId: session.tenantId,
        deviceId: device.id,
        action: "COMMAND_ISSUED",
        details: `${action} requested for ${device.label ?? device.mac}`,
        createdAt: now,
      },
    });

    return NextResponse.json({ ok: true, commandId: command.id, status: command.status });
  } catch (e) {
    if (e instanceof ManualModeError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
    }
    if (e instanceof CooldownError) {
      return NextResponse.json(
        { ok: false, error: e.message, retryAfterSeconds: e.retryAfterSeconds },
        { status: 429 },
      );
    }
    if (e instanceof DailyCapError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 429 });
    }
    if (e instanceof DeviceDisabledError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 403 });
    }
    throw e;
  }
}
