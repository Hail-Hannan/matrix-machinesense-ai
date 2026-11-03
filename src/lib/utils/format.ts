export function formatValue(
  value: number | null | undefined,
  unit = "",
  decimals = 1
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
}

export function formatBoolean(
  value: boolean | null | undefined,
  yes = "Yes",
  no = "No"
): string {
  if (value === null || value === undefined) return "N/A";
  return value ? yes : no;
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "No data yet";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function formatClockTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Data staleness check for connectivity indicators. If the most recent row
 * is older than staleMs, we should not claim the device is "online" just
 * because the website itself loaded.
 */
export function isDataStale(iso: string | null, staleMs = 90_000): boolean {
  if (!iso) return true;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return true;
  return Date.now() - then > staleMs;
}

/** Runtime counter (seconds) as "3d 04h 12m" / "4h 12m" / "12m". */
export function formatRuntime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds) || seconds < 0) return "N/A";
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${String(h % 24).padStart(2, "0")}h ${String(m % 60).padStart(2, "0")}m`;
  if (h > 0) return `${h}h ${String(m % 60).padStart(2, "0")}m`;
  return `${m}m`;
}
