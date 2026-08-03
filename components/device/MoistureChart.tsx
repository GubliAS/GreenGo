import { rampColor } from "@/lib/moisture";

/* The inline history chart on Device Dashboard: 24 bars, flex-1, bottom-anchored,
 * height as a percentage, top corners rounded only (2px 2px 0 0), each coloured
 * by the same ramp used for the segmented bar — but keyed to the bar's own value
 * rather than its position, since here the value is what varies.
 *
 * Empty state matters: an all-zero chart looks like a broken widget rather than
 * a device that hasn't reported, so a caption is rendered instead. */

export function MoistureChart({
  points,
  height = 64,
  label = "Moisture history",
}: {
  /** Percentage values, oldest → newest. */
  points: number[];
  height?: number;
  label?: string;
}) {
  if (points.length === 0) {
    return (
      <div
        className="text-meta text-muted border-hairline rounded-tile flex items-center justify-center border border-dashed"
        style={{ height }}
      >
        No readings in this range
      </div>
    );
  }

  return (
    <div
      className="flex items-end gap-0.75"
      style={{ height }}
      role="img"
      aria-label={`${label}: ${points.length} readings, latest ${points[points.length - 1]}%`}
    >
      {points.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-segment"
          style={{
            height: `${Math.max(8, Math.min(100, p))}%`,
            background: rampColor(Math.min(1, Math.max(0, p / 100))),
          }}
        />
      ))}
    </div>
  );
}
