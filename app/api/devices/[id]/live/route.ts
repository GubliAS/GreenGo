import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/* GET /api/devices/[id]/live — tenant dashboard poll target.
 * ESP posts every ~10s; the UI polls this every 5s for soil/temp/humidity/
 * light/pump state. Prefer polling over SSE here: serverless hosts don't keep
 * long-lived streams well, and the device is already on a fixed cadence. */

const STALE_AFTER_SECONDS = Number(process.env.DEVICE_STALE_AFTER_SECONDS ?? 120);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const device = await db.device.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!device) {
    return NextResponse.json({ ok: false, error: "Device not found." }, { status: 404 });
  }

  const [latestReading, recentReadings] = await Promise.all([
    db.reading.findFirst({
      where: { deviceId: device.id },
      orderBy: { recordedAt: "desc" },
    }),
    db.reading.findMany({
      where: { deviceId: device.id },
      orderBy: { recordedAt: "desc" },
      take: 24,
      select: { soilPct: true },
    }),
  ]);

  const isStale =
    !device.lastSeenAt ||
    Date.now() - device.lastSeenAt.getTime() > STALE_AFTER_SECONDS * 1000;

  const chartSeed = recentReadings
    .slice()
    .reverse()
    .map((r) => r.soilPct)
    .filter((v): v is number => v !== null);

  return NextResponse.json({
    ok: true,
    state: isStale ? "unknown" : "confirmed",
    soilPct: latestReading?.soilPct ?? null,
    relayOn: device.relayOn,
    mode: device.mode,
    metrics: {
      tempC: latestReading?.tempC ?? null,
      humidityPct: latestReading?.humidityPct ?? null,
      lightLux: latestReading?.lightLux ?? null,
      batteryV: device.batteryV,
    },
    lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
    lastSeenLabel: device.lastSeenAt
      ? `Last updated ${relativeSeconds(device.lastSeenAt)} ago`
      : "Never reported",
    chartSeed,
  });
}

function relativeSeconds(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}
