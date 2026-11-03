import { HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TONE, freshnessText } from "@/lib/utils/dashboard";
import { isDataStale } from "@/lib/utils/format";
import type { Severity, ThresholdResult } from "@/lib/utils/thresholds";
import type { QueryStatus } from "@/hooks/useLatestReading";

const word = (r: ThresholdResult) =>
  r.label === "NO LIMIT" ? "No limit set" : r.label === "N/A" ? "No data" : r.label[0] + r.label.slice(1).toLowerCase();

function Row({ label, value, text, severity }: { label: string; value?: string; text: string; severity: Severity }) {
  const t = TONE[severity];
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e6edf6] py-[5px] text-[13px] last:border-b-0 [@media(max-height:820px)]:py-[2px] [@media(max-height:820px)]:text-[12px]">
      <span className="text-[#33465e]">{label}</span>
      <span className="flex items-center gap-2">
        {value && <b className="text-[#0b2a5b]">{value}</b>}
        <span className="font-semibold" style={{ color: t.text }}>{text}</span>
      </span>
    </div>
  );
}

/**
 * Reports CURRENT readings against the limits in lib/config.ts. It does not
 * forecast or predict failures.
 */
export function HealthCard(props: {
  configured: boolean; queryStatus: QueryStatus; latestTimestamp: string | null;
  vibration: { max: number | null; result: ThresholdResult; unit: string };
  temperature: { value: number | null; result: ThresholdResult; unit: string };
  condition: Severity; abnormal: string[];
}) {
  const { vibration, temperature, condition, abnormal } = props;
  const fmt = (v: number | null, d: number, u: string) => (v === null ? undefined : `${v.toFixed(d)} ${u}`);
  const conditionText = condition === "unknown" ? "Not evaluated" : condition === "normal" ? "Normal" : condition === "warning" ? "Warning" : "Alarm";
  const abnormalText = condition === "unknown" ? "Not evaluated" : abnormal.length ? abnormal.join(", ") : "None detected";

  const fresh = props.latestTimestamp ? !isDataStale(props.latestTimestamp) : null;
  const gateway = !props.configured ? { v: "Not configured", ok: null as boolean | null }
    : props.queryStatus === "success" ? { v: "Online", ok: true as boolean | null }
    : props.queryStatus === "error" ? { v: "Offline", ok: false } : { v: "Connecting…", ok: null };
  const items = [
    { l: "Database", v: gateway.v, ok: gateway.ok },
    { l: "Updated", v: freshnessText(props.latestTimestamp), ok: fresh },
  ];

  return (
    <Card className="h-full">
      <h2 className="mb-0.5 flex shrink-0 items-center gap-2 text-[15px] font-bold text-[#0b2a5b]"><HeartPulse className="h-5 w-5" /> Machine Health</h2>
      <div className="flex min-h-0 flex-1 flex-col justify-around">
        <Row label="Vibration" value={fmt(vibration.max, 3, vibration.unit)} text={word(vibration.result)} severity={vibration.result.severity} />
        <Row label="Temperature" value={fmt(temperature.value, 1, temperature.unit)} text={word(temperature.result)} severity={temperature.result.severity} />
        <Row label="Condition" text={conditionText} severity={condition} />
        <Row label="Abnormal status" text={abnormalText} severity={abnormal.length ? condition : "unknown"} />
      </div>
      <div className="mt-1 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-[#e6edf6] pt-1.5 text-[11.5px]">
        {items.map((i) => {
          const t = i.ok === null ? TONE.warning : i.ok ? TONE.normal : TONE.danger;
          return (
            <span key={i.l} className="flex items-center gap-1.5 text-[#5d7088]">
              <i className="h-2 w-2 rounded-full" style={{ backgroundColor: t.dot }} />
              {i.l} <b style={{ color: t.text }}>{i.v}</b>
            </span>
          );
        })}
      </div>
    </Card>
  );
}
