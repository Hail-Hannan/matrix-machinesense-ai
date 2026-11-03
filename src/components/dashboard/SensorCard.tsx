import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { TONE } from "@/lib/utils/dashboard";
import type { ThresholdResult } from "@/lib/utils/thresholds";

/** One measurement: icon + title, big value + unit, and a status line against the configured limit. */
export function SensorCard({
  icon, iconBg, title, value, unit, result, note,
}: {
  icon: ReactNode; iconBg: string; title: string; value: string; unit?: string;
  /** Limit evaluation; omit for values with no limit (e.g. runtime) and pass `note` instead. */
  result?: ThresholdResult; note?: string;
}) {
  const na = value === "N/A";
  const tone = TONE[result?.severity ?? "unknown"];
  const status = result
    ? result.label === "NO LIMIT" ? "No limit set" : result.label === "N/A" ? "Waiting for data" : result.label[0] + result.label.slice(1).toLowerCase()
    : note ?? "";
  return (
    <Card className="h-full gap-1">
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>{icon}</span>
        <h2 className="min-w-0 text-[13px] font-bold leading-[1.15] text-[#0b2a5b]">{title}</h2>
      </div>
      <div className="mt-auto flex items-baseline gap-1.5">
        <span className={`text-[28px] font-bold leading-none ${na ? "text-[#8a9bb0]" : "text-[#0b2a5b]"}`}>{value}</span>
        {unit && !na && <span className="text-[13px] text-[#5d7088]">{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 text-[11.5px] text-[#5d7088]">
        {result && <i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />}
        <span className="truncate" style={result && result.severity !== "unknown" ? { color: tone.text, fontWeight: 600 } : undefined}>{status}</span>
      </div>
    </Card>
  );
}
