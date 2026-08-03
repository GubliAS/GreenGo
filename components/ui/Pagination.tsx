"use client";

/* DEV-004 — the handoff's five tables all render a fixed row set with no
 * pagination control. Geometry borrows from the time-range pills (radius 8,
 * mint fill when active) so it matches the one selector the handoff does have.
 *
 * Deliberately shows a row-range summary: with 10 days of 10-second telemetry
 * the raw table is ~86k rows, and a bare page-number strip would hide that. */

export function Pagination({
  page,
  pageCount,
  totalRows,
  pageSize,
  onPageChange,
  label = "Pagination",
}: {
  page: number;
  pageCount: number;
  totalRows?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (pageCount <= 1 && !totalRows) return null;

  const from = pageSize ? (page - 1) * pageSize + 1 : null;
  const to =
    pageSize && totalRows ? Math.min(page * pageSize, totalRows) : null;

  const pages = windowed(page, pageCount);

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      {totalRows !== undefined && from !== null && to !== null && (
        <div className="text-meta text-muted">
          <span className="font-mono">
            {from.toLocaleString()}–{to.toLocaleString()}
          </span>{" "}
          of <span className="font-mono">{totalRows.toLocaleString()}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <PageButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          ariaLabel="Previous page"
        >
          ←
        </PageButton>

        {pages.map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="text-faint text-label px-1">
              ·
            </span>
          ) : (
            <PageButton
              key={p}
              active={p === page}
              onClick={() => onPageChange(p)}
              ariaLabel={`Page ${p}`}
              ariaCurrent={p === page}
            >
              {p}
            </PageButton>
          ),
        )}

        <PageButton
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          ariaLabel="Next page"
        >
          →
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  active = false,
  disabled = false,
  onClick,
  ariaLabel,
  ariaCurrent,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
  ariaCurrent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent ? "page" : undefined}
      className={`rounded-sm text-label min-w-8 cursor-pointer border-0 px-2.5 py-1.75 font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-mint text-canopy" : "text-muted bg-transparent hover:bg-app"
      }`}
    >
      {children}
    </button>
  );
}

/** Page numbers with ellipsis gaps: 1 · 4 5 6 · 20 */
function windowed(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push(null);
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pageCount - 1) out.push(null);
  out.push(pageCount);
  return out;
}
