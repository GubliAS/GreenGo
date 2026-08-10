import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateDevice, DeviceAuthError } from "@/lib/device-auth";
import { soilRawToPercent } from "@/lib/moisture";
import { evaluateAlertsForReading } from "@/lib/alerts";
import { expireStaleCommands, collectPendingCommand, reconcileSentCommand } from "@/lib/commands";
import type { PumpMode } from "@prisma/client";

/* POST /api/telemetry — the device auth regime, header-authenticated, no
 * session/cookie. This is the entire remote-control mechanism: the server can
 * never reach the device, so every command the device will ever receive is
 * handed to it here, in the response to its own check-in.
 *
 * Order of operations matters:
 *   1. authenticate
 *   2. validate payload
 *   3. persist the reading (source of truth first, always)
 *   4. update the device's live-state mirror (lastSeenAt, mode, relayOn, ...)
 *   5. reconcile any outstanding SENT command against the NEW relay state
 *      (must happen before we hand out a fresh command, so a just-confirmed
 *      cooldown/cap check below sees up-to-date IrrigationEvent rows)
 *   6. evaluate alert rules against the new reading
 *   7. expire anything the device took too long to collect
 *   8. hand back the oldest still-valid pending command, if any
 */

type TelemetryBody = {
  soilRaw: number;
  soilPct?: number;
  tempC?: number;
  humidityPct?: number;
  lightLux?: number;
  relayOn: boolean;
  mode: PumpMode;
  signalDbm?: number;
  batteryV?: number;
};

function isValidBody(body: unknown): body is TelemetryBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  if (typeof b.soilRaw !== "number") return false;
  if (typeof b.relayOn !== "boolean") return false;
  if (b.mode !== "AUTO" && b.mode !== "MANUAL") return false;
  if (b.soilPct !== undefined && typeof b.soilPct !== "number") return false;
  if (b.tempC !== undefined && typeof b.tempC !== "number") return false;
  if (b.humidityPct !== undefined && typeof b.humidityPct !== "number") return false;
  if (b.lightLux !== undefined && typeof b.lightLux !== "number") return false;
  if (b.signalDbm !== undefined && typeof b.signalDbm !== "number") return false;
  if (b.batteryV !== undefined && typeof b.batteryV !== "number") return false;
  return true;
}

export async function POST(request: Request) {
  let device;
  try {
    device = await authenticateDevice(request);
  } catch (e) {
    if (e instanceof DeviceAuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 401 });
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ ok: false, error: "Invalid telemetry payload." }, { status: 400 });
  }

  const now = new Date();

  const calibration = await db.calibration.findUnique({ where: { deviceId: device.id } });
  // Prefer the device's own % (matches the LCD) when provided; otherwise map
  // soilRaw through the tenant's dry/wet calibration endpoints.
  const soilPct =
    typeof body.soilPct === "number"
      ? Math.max(0, Math.min(100, Math.round(body.soilPct)))
      : soilRawToPercent(body.soilRaw, calibration);

  const reading = await db.reading.create({
    data: {
      deviceId: device.id,
      recordedAt: now,
      soilRaw: body.soilRaw,
      soilPct,
      tempC: body.tempC ?? null,
      humidityPct: body.humidityPct ?? null,
      lightLux: body.lightLux ?? null,
      relayOn: body.relayOn,
      mode: body.mode,
      signalDbm: body.signalDbm ?? null,
      batteryV: body.batteryV ?? null,
    },
  });

  await db.device.update({
    where: { id: device.id },
    data: {
      lastSeenAt: now,
      mode: body.mode,
      relayOn: body.relayOn,
      signalDbm: body.signalDbm ?? device.signalDbm,
      batteryV: body.batteryV ?? device.batteryV,
    },
  });

  await reconcileSentCommand({ device, relayOn: body.relayOn, mode: body.mode, now });

  if (device.tenantId && soilPct !== null) {
    await evaluateAlertsForReading({
      deviceId: device.id,
      tenantId: device.tenantId,
      reading: { soilPct, tempC: body.tempC ?? null, humidityPct: body.humidityPct ?? null },
      now,
    });
  }

  await expireStaleCommands(device.id, now);
  const pending = await collectPendingCommand(device.id, now);

  return NextResponse.json({
    ok: true,
    readingId: reading.id,
    command: pending
      ? { id: pending.id, action: pending.action, maxRunSeconds: pending.maxRunSeconds }
      : null,
  });
}
