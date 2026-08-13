/** Display helpers for tenant logs / alerts (no domain logic). */

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return `${m}m ${rem.toString().padStart(2, "0")}s`;
}

/** Compact absolute-ish labels for irrigation / notification lists. */
export function formatWhen(date: Date, now = new Date()): string {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date >= startOfToday) return `Today, ${time}`;
  if (date >= startOfYesterday) return `Yesterday, ${time}`;

  const days = Math.round((startOfToday.getTime() - date.getTime()) / (24 * 3600 * 1000));
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago, ${time}`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeAgo(date: Date, now = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return formatWhen(date, now);
}

/** +233241234501 → +233 24 123 4501 */
export function formatPhoneDisplay(e164: string): string {
  const m = e164.match(/^\+(\d{3})(\d{2})(\d{3})(\d{4})$/);
  if (!m) return e164;
  return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
}

/** Fractional hour from env (e.g. 21 or 5.5) → "9:00 PM" / "5:30 AM". */
export function formatQuietHourLabel(hourFloat: number): string {
  const h = Math.floor(hourFloat) % 24;
  const minutes = Math.round((hourFloat - Math.floor(hourFloat)) * 60);
  const d = new Date();
  d.setHours(h, minutes, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
