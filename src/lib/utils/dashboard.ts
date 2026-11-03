import type { Severity } from "./thresholds";
import type { BadgeTone } from "@/components/ui/Badge";

/** UI vocabulary: Normal / Caution / Alert (maps the existing severities). */
export function uiLabel(s: Severity): string {
  return s === "normal" ? "NORMAL" : s === "warning" ? "CAUTION" : s === "danger" ? "ALERT" : "N/A";
}

export const TONE: Record<Severity, { text: string; bg: string; dot: string }> = {
  normal: { text: "#15803d", bg: "#dcf3e4", dot: "#16a34a" },
  warning: { text: "#a45f06", bg: "#fdecc8", dot: "#d97706" },
  danger: { text: "#b91c1c", bg: "#fbdada", dot: "#dc2626" },
  unknown: { text: "#5b6f7e", bg: "#e7eef3", dot: "#94a3b8" },
};

/** Operating state shown in the Machine Status card, from the status text the device reports. */
export function operatingState(status: string | null, hasRow: boolean, stale: boolean): { tone: BadgeTone; label: string } {
  if (!hasRow) return { tone: "unknown", label: "NO DATA" };
  if (stale) return { tone: "unknown", label: "NOT REPORTING" };
  const s = (status ?? "").trim().toLowerCase();
  if (!s) return { tone: "unknown", label: "UNKNOWN" };
  if (/(fault|alarm|error|trip|fail)/.test(s)) return { tone: "danger", label: "FAULT" };
  if (/(run|operat|active|^on$)/.test(s)) return { tone: "normal", label: "RUNNING" };
  if (/(idle|standby)/.test(s)) return { tone: "info", label: "IDLE" };
  if (/(stop|off)/.test(s)) return { tone: "unknown", label: "STOPPED" };
  return { tone: "unknown", label: s.toUpperCase() };
}

const tz = "Asia/Kuala_Lumpur";

export function formatStationTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const mon = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short" }).format(d);
  return `${g("day")} ${mon} ${g("year")} · ${g("hour")}:${g("minute")} MYT`;
}

export function formatHourMinute(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ms));
}

export function agoLong(iso: string | null): string {
  if (!iso) return "no data yet";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(s)) return "unknown";
  if (s < 5) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

export function freshnessText(iso: string | null): string {
  if (!iso) return "No data";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(s)) return "Unknown";
  if (s < 60) return "< 1 minute";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.floor(m / 60);
  return `${h} hour${h === 1 ? "" : "s"}`;
}

export function formatClockSeconds(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(ms));
}

export function formatHeaderDateTime(ms: number): string {
  const d = new Date(ms);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit" }).format(d);
  const mon = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short" }).format(d);
  const year = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric" }).format(d);
  return `${day} ${mon} ${year}   ${formatClockSeconds(ms)}`;
}

export function formatShortDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit" }).format(d);
  const mon = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short" }).format(d);
  return `${day} ${mon} ${formatClockSeconds(d.getTime())}`;
}
