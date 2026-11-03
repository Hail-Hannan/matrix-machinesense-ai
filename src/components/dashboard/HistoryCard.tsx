import { History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { UNITS } from "@/lib/config";
import { formatShortDateTime } from "@/lib/utils/dashboard";
import { formatRuntime } from "@/lib/utils/format";
import type { MachineDataRow } from "@/lib/supabase/types";

const n = (v: number | null, d: number) => (v === null ? "N/A" : v.toFixed(d));

export function HistoryCard({ records, emptyText }: { records: MachineDataRow[]; emptyText: string }) {
  const th = "px-2 py-0.5 text-left text-[11.5px] font-medium text-[#5d7088]";
  const td = "truncate px-2 py-[3px] text-[12.5px] text-[#0b2a5b] [@media(max-height:820px)]:py-[1px] [@media(max-height:820px)]:text-[12px]";
  return (
    <Card className="h-full gap-1">
      <h2 className="flex shrink-0 items-center justify-between gap-2 text-[15px] font-bold text-[#0b2a5b]">
        <span className="flex items-center gap-2"><History className="h-5 w-5" /> Historical Machine Data</span>
        <span className="text-[11.5px] font-normal text-[#5d7088]">Latest 5 readings</span>
      </h2>
      <div className="min-h-0 flex-1">
        {records.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12.5px] text-[#8a9bb0]">{emptyText}</div>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-[#e6edf6]">
                <th className={`${th} w-[19%]`}>Time (MYT)</th>
                <th className={th}>Status</th>
                <th className={th}>X ({UNITS.vibration})</th>
                <th className={th}>Y ({UNITS.vibration})</th>
                <th className={th}>Z ({UNITS.vibration})</th>
                <th className={th}>Temp ({UNITS.temperature})</th>
                <th className={th}>Current ({UNITS.current})</th>
                <th className={th}>Runtime</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-[#eef3f9] last:border-b-0">
                  <td className={td}>{formatShortDateTime(r.created_at)}</td>
                  <td className={td}>{r.machine_status ?? "N/A"}</td>
                  <td className={td}>{n(r.vibration_x, 3)}</td>
                  <td className={td}>{n(r.vibration_y, 3)}</td>
                  <td className={td}>{n(r.vibration_z, 3)}</td>
                  <td className={td}>{n(r.surface_temperature_c, 1)}</td>
                  <td className={td}>{n(r.current_a, 2)}</td>
                  <td className={td}>{formatRuntime(r.runtime_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
