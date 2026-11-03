"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { useLatestReading } from "@/hooks/useLatestReading";
import { useLastHours } from "@/hooks/useLastHours";
import { useRecentRecords } from "@/hooks/useRecentRecords";
import { useMachines } from "@/hooks/useMachines";
import { CHART_WINDOW_HOURS } from "@/lib/config";

export default function DashboardPage() {
  const machines = useMachines();
  const [picked, setPicked] = useState<string | null>(null);
  // Until the user picks one, follow the machine that reported most recently.
  const machineId = picked ?? machines[0] ?? null;

  const { data, connectionState, queryStatus, error } = useLatestReading(machineId);
  const { rows } = useLastHours(CHART_WINDOW_HOURS, machineId);
  const { records } = useRecentRecords(machineId, 5);

  // Re-render every 5 s so "x seconds ago" and freshness labels stay current.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  // Unlike the weather dashboard, the layout is still shown when Supabase is not
  // configured; every value reads "N/A" and the header says "Not configured".
  return (
    <DashboardView
      configured={connectionState !== "unconfigured"}
      latest={data}
      rows={rows}
      records={records}
      queryStatus={queryStatus}
      latestTimestamp={data?.created_at ?? null}
      error={error}
      machines={machines}
      machineId={machineId}
      onMachineChange={setPicked}
    />
  );
}
