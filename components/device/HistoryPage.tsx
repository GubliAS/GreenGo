"use client";

import { useState } from "react";
import { BackLink, PageTitle, Card } from "../ui/Card";
import { RangePills } from "../ui/SegmentedControl";
import { MoistureChart } from "./MoistureChart";
import { Cell, DataTable, TableRow, type Column } from "../ui/DataTable";
import { Pagination } from "../ui/Pagination";

/* /devices/[id]/history — DEV-005, no handoff design. Promotes the
 * dashboard's inline history block to a full page (handoff/tenant.md §7):
 * RangePills, a larger MoistureChart, and a paginated readings table
 * including raw soil values — calibration errors are only diagnosable from
 * raw, and the schema stores it precisely so this isn't recoverable-later
 * only, it's visible now. */

const RANGES = ["12h", "24h", "48h", "Week", "Month"] as const;
const PAGE_SIZE = 10;
const TOTAL_ROWS = 240; // 24h at 10-minute-aggregated points, for this mock

const COLUMNS: Column[] = [
  { key: "ts", header: "Timestamp", width: "1.2fr" },
  { key: "soil", header: "Soil %", width: "0.7fr" },
  { key: "raw", header: "Soil raw", width: "0.7fr" },
  { key: "temp", header: "Temp", width: "0.7fr" },
  { key: "hum", header: "Humidity", width: "0.8fr" },
  { key: "relay", header: "Relay", width: "0.6fr" },
];

function buildChartPoints(): number[] {
  return Array.from({ length: 48 }, (_, i) => {
    const h = 24 + Math.round(Math.sin(i / 4) * 16 + (i % 7) * 2.5);
    return Math.max(6, Math.min(100, h));
  });
}

function buildRows(page: number) {
  return Array.from({ length: PAGE_SIZE }, (_, i) => {
    const idx = (page - 1) * PAGE_SIZE + i;
    const soil = Math.max(18, Math.min(72, 40 - (idx % 24) + Math.round(Math.sin(idx / 3) * 8)));
    return {
      ts: `06:${(59 - (idx % 60)).toString().padStart(2, "0")}:${(idx % 6) * 10}`,
      soil,
      raw: 612 - Math.round((soil / 100) * (612 - 198)),
      temp: (26.5 - (idx % 10) * 0.1).toFixed(1),
      hum: 58 + (idx % 12),
      relay: idx % 17 === 0 ? "ON" : "OFF",
    };
  });
}

export function HistoryPage({ deviceLabel }: { deviceLabel: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>("24h");
  const [page, setPage] = useState(1);
  const chartPoints = buildChartPoints();
  const rows = buildRows(page);
  const pageCount = Math.ceil(TOTAL_ROWS / PAGE_SIZE);

  return (
    <div className="max-w-app mx-auto flex flex-col gap-4.5">
      <div>
        <BackLink href={`/devices/gh-1`}>← {deviceLabel}</BackLink>
        <PageTitle className="mt-1.5">Moisture history — {deviceLabel}</PageTitle>
      </div>

      <Card variant="hero" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-canopy font-semibold">
            Moisture, {range.toLowerCase()}
          </span>
          <RangePills
            value={range}
            onChange={setRange}
            options={RANGES.map((r) => ({ value: r, label: r }))}
          />
        </div>
        <MoistureChart points={chartPoints} height={120} />
      </Card>

      {rows.length === 0 ? (
        <Card className="text-meta text-muted text-center">
          No readings in this range
        </Card>
      ) : (
        <>
          <DataTable columns={COLUMNS} minWidth={640} density="compact" caption="Readings">
            {rows.map((r) => (
              <TableRow key={r.ts + r.raw} columns={COLUMNS} minWidth={640} density="compact">
                <Cell tone="canopy" mono>
                  {r.ts}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.soil}%
                </Cell>
                <Cell tone="muted" mono>
                  {r.raw}
                </Cell>
                <Cell tone="canopy" mono>
                  {r.temp}°
                </Cell>
                <Cell tone="canopy" mono>
                  {r.hum}%
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
            totalRows={TOTAL_ROWS}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="History pages"
          />
        </>
      )}
    </div>
  );
}
