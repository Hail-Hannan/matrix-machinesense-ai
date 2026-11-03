import { Activity, LineChart as LineIcon, Thermometer, Timer, Zap } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MachineStatusCard } from "./MachineStatusCard";
import { SensorCard } from "./SensorCard";
import { ChartCard, type ChartSeries } from "./ChartCard";
import { HealthCard } from "./HealthCard";
import { HistoryCard } from "./HistoryCard";
import { CHART_WINDOW_HOURS, LIMITS, UNITS } from "@/lib/config";
import { evaluateLimit, worstSeverity } from "@/lib/utils/thresholds";
import { formatRuntime, isDataStale } from "@/lib/utils/format";
import type { QueryStatus } from "@/hooks/useLatestReading";
import type { MachineDataRow } from "@/lib/supabase/types";
import type { ChartRow } from "@/lib/supabase/queries";

const X = "#1d6af5", Y = "#22a559", Z = "#f5b800", TEMP = "#ef2b3a", CUR = "#7c3aed";
const VIB_SERIES: ChartSeries[] = [
  { key: "vibration_x", label: "X", color: X },
  { key: "vibration_y", label: "Y", color: Y },
  { key: "vibration_z", label: "Z", color: Z },
];
const f = (v: number | null | undefined, d: number) => (v === null || v === undefined ? "N/A" : v.toFixed(d));

export function DashboardView(props: {
  configured: boolean;
  latest: MachineDataRow | null;
  rows: ChartRow[];
  records: MachineDataRow[];
  queryStatus: QueryStatus;
  latestTimestamp: string | null;
  error?: string | null;
  machines: string[];
  machineId: string | null;
  onMachineChange: (id: string) => void;
}) {
  const { configured, latest, rows, records, queryStatus, latestTimestamp, error } = props;
  const stale = isDataStale(latestTimestamp);

  // Evaluate the CURRENT reading against the limits in lib/config.ts.
  const vib = {
    x: evaluateLimit(latest?.vibration_x == null ? null : Math.abs(latest.vibration_x), LIMITS.vibration),
    y: evaluateLimit(latest?.vibration_y == null ? null : Math.abs(latest.vibration_y), LIMITS.vibration),
    z: evaluateLimit(latest?.vibration_z == null ? null : Math.abs(latest.vibration_z), LIMITS.vibration),
  };
  const axes = [latest?.vibration_x, latest?.vibration_y, latest?.vibration_z].filter((v): v is number => v != null).map(Math.abs);
  const vibMax = axes.length ? Math.max(...axes) : null;
  const vibResult = evaluateLimit(vibMax, LIMITS.vibration);
  const tempResult = evaluateLimit(latest?.surface_temperature_c, LIMITS.temperature);
  const curResult = evaluateLimit(latest?.current_a, LIMITS.current);
  const condition = stale ? "unknown" : worstSeverity([vibResult, tempResult, curResult]);
  const abnormal = stale ? [] : [
    vibResult.severity === "warning" || vibResult.severity === "danger" ? "vibration" : "",
    tempResult.severity === "warning" || tempResult.severity === "danger" ? "temperature" : "",
    curResult.severity === "warning" || curResult.severity === "danger" ? "current" : "",
  ].filter(Boolean);

  const monitoring = !configured ? "Not connected"
    : queryStatus === "error" ? "Database error"
    : !latest ? "Awaiting data"
    : stale ? "Data stale"
    : condition === "unknown" ? "Receiving data"
    : condition === "normal" ? "All normal" : condition === "warning" ? "Warning" : "Alarm";

  const emptyText = !configured ? "Not connected. Add the Supabase URL and anon key to .env.local." : "Waiting for readings…";

  return (
    <div className="flex min-h-dvh flex-col xl:h-dvh xl:min-h-[600px] xl:overflow-hidden">
      <Header
        configured={configured} queryStatus={queryStatus} latestTimestamp={latestTimestamp}
        machines={props.machines} machineId={props.machineId} onMachineChange={props.onMachineChange}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-2.5">
        {error && (
          <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12.5px] text-red-700">
            <b>Supabase query failed</b> — <span className="font-mono text-[11.5px]">{error}</span>
          </div>
        )}

        {/* Row 1: machine status + the six measurements */}
        <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[1.35fr_repeat(6,1fr)]">
          <MachineStatusCard latest={latest} stale={stale} monitoring={monitoring} monitoringSeverity={stale || !latest ? "unknown" : condition} />
          <SensorCard icon={<Activity className="h-5 w-5 text-[#1d6af5]" />} iconBg="#e8f0fd" title="X-axis vibration" value={f(latest?.vibration_x, 3)} unit={UNITS.vibration} result={vib.x} />
          <SensorCard icon={<Activity className="h-5 w-5 text-[#22a559]" />} iconBg="#e6f6ec" title="Y-axis vibration" value={f(latest?.vibration_y, 3)} unit={UNITS.vibration} result={vib.y} />
          <SensorCard icon={<Activity className="h-5 w-5 text-[#d49a00]" />} iconBg="#fff6d9" title="Z-axis vibration" value={f(latest?.vibration_z, 3)} unit={UNITS.vibration} result={vib.z} />
          <SensorCard icon={<Thermometer className="h-5 w-5 text-[#e11d1d]" />} iconBg="#fdecec" title="Surface temperature" value={f(latest?.surface_temperature_c, 1)} unit={UNITS.temperature} result={tempResult} />
          <SensorCard icon={<Zap className="h-5 w-5 text-[#7c3aed]" />} iconBg="#f1eafd" title="Current" value={f(latest?.current_a, 2)} unit={UNITS.current} result={curResult} />
          <SensorCard icon={<Timer className="h-5 w-5 text-[#0b2a5b]" />} iconBg="#eef3fb" title="Machine runtime" value={formatRuntime(latest?.runtime_seconds)} note="Reported by device" />
        </div>

        {/* Row 2: charts */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-[1.5fr_1fr_1fr]">
          <div className="min-h-[220px] xl:min-h-0">
            <ChartCard title="Vibration" icon={<LineIcon className="h-5 w-5" />} unit={UNITS.vibration} decimals={3} series={VIB_SERIES} rows={rows} windowHours={CHART_WINDOW_HOURS} emptyText={emptyText} />
          </div>
          <div className="min-h-[220px] xl:min-h-0">
            <ChartCard title="Surface Temperature" icon={<Thermometer className="h-5 w-5" />} unit={UNITS.temperature} decimals={1} series={[{ key: "surface_temperature_c", label: "Temperature", color: TEMP }]} rows={rows} windowHours={CHART_WINDOW_HOURS} emptyText={emptyText} />
          </div>
          <div className="min-h-[220px] xl:min-h-0">
            <ChartCard title="Current" icon={<Zap className="h-5 w-5" />} unit={UNITS.current} decimals={2} series={[{ key: "current_a", label: "Current", color: CUR }]} rows={rows} windowHours={CHART_WINDOW_HOURS} emptyText={emptyText} />
          </div>
        </div>

        {/* Row 3: machine health + historical data */}
        <div className="grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-[1fr_2.6fr]">
          <div className="min-h-[190px] xl:min-h-0">
            <HealthCard
              configured={configured} queryStatus={queryStatus} latestTimestamp={latestTimestamp}
              vibration={{ max: vibMax, result: vibResult, unit: UNITS.vibration }}
              temperature={{ value: latest?.surface_temperature_c ?? null, result: tempResult, unit: UNITS.temperature }}
              condition={condition} abnormal={abnormal}
            />
          </div>
          <div className="min-h-[190px] xl:min-h-0"><HistoryCard records={records} emptyText={emptyText} /></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
