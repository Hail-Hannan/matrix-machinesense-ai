"use client";

import { ReactNode, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatHourMinute } from "@/lib/utils/dashboard";
import type { ChartRow } from "@/lib/supabase/queries";

const HOUR = 3600_000;

export interface ChartSeries { key: keyof Omit<ChartRow, "created_at">; label: string; color: string }

type Pt = { t: number } & Record<string, number | undefined>;

/** Average each series into ~90 time buckets across the window. */
function bucketise(rows: ChartRow[], series: ChartSeries[], bucketMs: number): Pt[] {
  const m = new Map<number, Record<string, number[]>>();
  for (const r of rows) {
    const k = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs + bucketMs / 2;
    const b = m.get(k) ?? {};
    for (const s of series) {
      const v = r[s.key];
      if (v !== null && v !== undefined) (b[s.key] ??= []).push(v);
    }
    m.set(k, b);
  }
  const avg = (a?: number[]) => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : undefined);
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([t, b]) => {
    const pt: Pt = { t };
    for (const s of series) pt[s.key] = avg(b[s.key]);
    return pt;
  });
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[#33465e]">
      <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function ChartCard({
  title, icon, unit, decimals = 2, series, rows, windowHours, emptyText,
}: {
  title: string; icon: ReactNode; unit: string; decimals?: number; series: ChartSeries[];
  rows: ChartRow[]; windowHours: number; emptyText: string;
}) {
  const end = Date.now();
  const start = end - windowHours * HOUR;
  const data = useMemo(() => bucketise(rows, series, (windowHours * HOUR) / 90),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, windowHours]);
  const step = (windowHours * HOUR) / 6;
  const first = Math.ceil(start / step) * step;
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => first + i * step).filter((t) => t <= end);

  return (
    <Card className="h-full gap-1">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0b2a5b]">{icon} {title} ({unit})</h2>
        {series.length > 1 && (
          <div className="flex items-center gap-x-3">{series.map((s) => <LegendItem key={s.key} color={s.color} label={s.label} />)}</div>
        )}
      </div>
      <div className="relative min-h-[80px] flex-1">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-center text-[12.5px] text-[#8a9bb0]">{emptyText}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e3ebf5" />
              <XAxis dataKey="t" type="number" domain={[start, end]} ticks={ticks} allowDataOverflow tickFormatter={(v: number) => formatHourMinute(v)} tick={{ fontSize: 11, fill: "#475b73" }} axisLine={false} tickLine={false} tickMargin={6} />
              <YAxis domain={["auto", "auto"]} tickFormatter={(v: number) => v.toFixed(decimals > 1 ? 1 : 0)} tick={{ fontSize: 11, fill: "#475b73" }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(v: number) => formatHourMinute(v)}
                formatter={(v: number, name: string) => [`${v.toFixed(decimals)} ${unit}`, series.find((s) => s.key === name)?.label ?? name]}
                contentStyle={{ borderRadius: 10, border: "1px solid #e1e9f3", fontSize: 12 }}
              />
              {series.map((s) => (
                <Line key={s.key} dataKey={s.key} type="monotone" stroke={s.color} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
