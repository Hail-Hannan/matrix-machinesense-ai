import type { Limit } from "@/lib/config";

export type Severity = "normal" | "warning" | "danger" | "unknown";

export interface ThresholdResult {
  severity: Severity;
  label: string;
}

/**
 * Compares a reading with the limits configured in lib/config.ts.
 * No reading -> N/A. No limit configured -> "NO LIMIT": the value is shown but
 * never labelled normal or abnormal, because nothing defines what normal is.
 */
export function evaluateLimit(value: number | null | undefined, limit: Limit): ThresholdResult {
  if (value === null || value === undefined || Number.isNaN(value)) return { severity: "unknown", label: "N/A" };
  if (limit.warn === null && limit.alarm === null) return { severity: "unknown", label: "NO LIMIT" };
  if (limit.alarm !== null && value >= limit.alarm) return { severity: "danger", label: "ALARM" };
  if (limit.warn !== null && value >= limit.warn) return { severity: "warning", label: "WARNING" };
  return { severity: "normal", label: "NORMAL" };
}

/** Most severe of the evaluated results; "unknown" when nothing could be evaluated. */
export function worstSeverity(list: ThresholdResult[]): Severity {
  const evaluated = list.filter((r) => r.label !== "N/A" && r.label !== "NO LIMIT").map((r) => r.severity);
  if (evaluated.length === 0) return "unknown";
  return evaluated.includes("danger") ? "danger" : evaluated.includes("warning") ? "warning" : "normal";
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "normal":
      return "text-status-normal border-status-normal/40 bg-status-normal/10";
    case "warning":
      return "text-status-warning border-status-warning/40 bg-status-warning/10";
    case "danger":
      return "text-status-danger border-status-danger/40 bg-status-danger/10";
    default:
      return "text-slate-600 border-slate-400/40 bg-slate-400/10";
  }
}

export function severityDot(severity: Severity): string {
  switch (severity) {
    case "normal":
      return "bg-status-normal";
    case "warning":
      return "bg-status-warning";
    case "danger":
      return "bg-status-danger";
    default:
      return "bg-slate-500";
  }
}
