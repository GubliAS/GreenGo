"use client";

import { useRouter } from "next/navigation";
import { BackLink, PageTitle, Card } from "../ui/Card";
import { RangePills } from "../ui/SegmentedControl";
import { MoistureChart } from "./MoistureChart";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { Pagination } from "../ui/Pagination";
import { EmptyState } from "../ui/Feedback";

/* /devices/[slug]/history — DEV-005. Server loads real Reading rows; this
 * client shell only handles range/page navigation via the URL. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;

const COLUMNS: Column[] = [
  { key: "ts", header: "Timestamp", width: "1.2fr" },
  { key: "soil", header: "Soil %", width: "0.7fr" },
  { key: "raw", header: "Soil raw", width: "0.7fr" },
  { key: "temp", header: "Temp", width: "0.7fr" },
  { key: "hum", header: "Humidity", width: "0.8fr" },
  { key: "relay", header: "Relay", width: "0.6fr" },
];

export type HistoryRow = {
  id: string;
  ts: string;
  soil: number | null;
  raw: number;
  temp: number | null;
  hum: number | null;
  relay: string;
};

export function HistoryPage({
  deviceLabel,
  deviceSlug,
  range,
  page,
  pageCount,
  totalRows,
  pageSize,
  chartPoints,
  rows,
}: {
  deviceLabel: string;
  deviceSlug: string;
  range: (typeof RANGES)[number];
  page: number;
  pageCount: number;
  totalRows: number;
  pageSize: number;
  chartPoints: number[];
  rows: HistoryRow[];
}) {
  const router = useRouter();

  function go(next: { range?: string; page?: number }) {
    const params = new URLSearchParams();
    params.set("range", next.range ?? range);
    params.set("page", String(next.page ?? page));
    router.push(`/devices/${deviceSlug}/history?${params.toString()}`);
  }

  return (
    <div className="max-w-app mx-auto flex flex-col gap-4.5">
      <div>
        <BackLink href={`/devices/${deviceSlug}`}>← {deviceLabel}</BackLink>
        <PageTitle className="mt-1.5">Moisture history — {deviceLabel}</PageTitle>
      </div>

      <Card variant="hero" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-canopy font-semibold">
            Moisture, {range.toLowerCase()}
          </span>
          <div className="-mx-1 overflow-x-auto px-1">
            <RangePills
              value={range}
              onChange={(v) => go({ range: v, page: 1 })}
              options={RANGES.map((r) => ({ value: r, label: r }))}
            />
          </div>
        </div>
        {chartPoints.length > 0 ? (
          <MoistureChart points={chartPoints} height={120} />
        ) : (
          <div className="text-meta text-muted py-8 text-center">
            No moisture readings in this range yet.
          </div>
        )}
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No readings in this range"
          body="Telemetry from the ESP will show up here as soon as the device posts."
        />
      ) : (
        <>
          <DataTable columns={COLUMNS} minWidth={640} density="compact" caption="Readings">
            {rows.map((r) => (
              <TableRow key={r.id} columns={COLUMNS} minWidth={640} density="compact">
                <Cell tone="canopy" mono>
                  {r.ts}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.soil === null ? "—" : `${r.soil}%`}
                </Cell>
                <Cell tone="muted" mono>
                  {r.raw}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.temp === null ? "—" : `${r.temp}°`}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.hum === null ? "—" : `${r.hum}%`}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.relay}
                </Cell>
              </TableRow>
            ))}
          </DataTable>
          <Pagination
            page={page}
            pageCount={pageCount}
            totalRows={totalRows}
            pageSize={pageSize}
            onPageChange={(p) => go({ page: p })}
            label="Reading pages"
          />
        </>
      )}
    </div>
  );
}
