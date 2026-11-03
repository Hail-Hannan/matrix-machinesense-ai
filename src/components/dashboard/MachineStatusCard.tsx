import { Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { operatingState } from "@/lib/utils/dashboard";
import { formatRuntime } from "@/lib/utils/format";
import type { Severity } from "@/lib/utils/thresholds";
import type { MachineDataRow } from "@/lib/supabase/types";

const MON_COLOR: Record<Severity, string> = { normal: "#15803d", warning: "#a45f06", danger: "#b91c1c", unknown: "#5b6f7e" };

export function MachineStatusCard({
  latest, stale, monitoring, monitoringSeverity,
}: { latest: MachineDataRow | null; stale: boolean; monitoring: string; monitoringSeverity: Severity }) {
  const op = operatingState(latest?.machine_status ?? null, latest !== null, stale);
  const runtime = formatRuntime(latest?.runtime_seconds);
  return (
    <Card className="h-full gap-1.5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className="flex items-center gap-1.5 text-[14px] font-bold leading-tight text-[#0b2a5b]"><Cpu className="h-[18px] w-[18px] shrink-0" />Machine Status</h2>
        <Badge tone={op.tone} label={op.label} />
      </div>
      <div className="mt-auto space-y-0.5 text-[12.5px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#5d7088]">Monitoring</span>
          <b className="truncate" style={{ color: MON_COLOR[monitoringSeverity] }}>{monitoring}</b>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#5d7088]">Runtime</span>
          <b className={runtime === "N/A" ? "text-[#8a9bb0]" : "text-[#0b2a5b]"}>{runtime}</b>
        </div>
      </div>
    </Card>
  );
}
