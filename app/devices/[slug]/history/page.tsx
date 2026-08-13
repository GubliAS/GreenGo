import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { HistoryPage } from "@/components/device/HistoryPage";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDeviceForSubpath } from "@/lib/device-route";
import { formatTimestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Moisture history — GreenGo" };
export const dynamic = "force-dynamic";

const RANGE_MS: Record<string, number> = {
  "12h": 12 * 3600_000,
  "24h": 24 * 3600_000,
  "48h": 48 * 3600_000,
  Week: 7 * 24 * 3600_000,
  Month: 30 * 24 * 3600_000,
};

const PAGE_SIZE = 10;

export default async function DeviceHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const range = sp.range && RANGE_MS[sp.range] ? sp.range : "24h";
  const page = Math.max(1, Number(sp.page) || 1);

  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);
  const device = await resolveTenantDeviceForSubpath(slug, tenantId, "history");

  const since = new Date(Date.now() - RANGE_MS[range]!);
  const where = { deviceId: device.id, recordedAt: { gte: since } };

  const [totalRows, readings, chartSource] = await Promise.all([
    db.reading.count({ where }),
    db.reading.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.reading.findMany({
      where,
      orderBy: { recordedAt: "asc" },
      select: { soilPct: true, recordedAt: true },
      take: 500,
    }),
  ]);

  const chartPoints = downsample(
    chartSource.map((r) => r.soilPct).filter((v): v is number => v !== null),
    48,
  );

  const rows = readings.map((r) => ({
    id: r.id,
    ts: formatTimestamp(r.recordedAt),
    soil: r.soilPct,
    raw: r.soilRaw,
    temp: r.tempC,
    hum: r.humidityPct,
    relay: r.relayOn ? "ON" : "OFF",
  }));

  const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" deviceSlug={device.slug} />
      <div className="p-page">
        <HistoryPage
          deviceLabel={device.label ?? device.mac}
          deviceSlug={device.slug}
          range={range as "12h" | "24h" | "48h" | "Week" | "Month"}
          page={page}
          pageCount={pageCount}
          totalRows={totalRows}
          pageSize={PAGE_SIZE}
          chartPoints={chartPoints}
          rows={rows}
        />
      </div>
    </div>
  );
}

function downsample(points: number[], maxPoints: number): number[] {
  if (points.length <= maxPoints) return points;
  const out: number[] = [];
  const step = points.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.min(points.length - 1, Math.floor(i * step))]!);
  }
  return out;
}
