"use client";

import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchLastHours, type ChartRow } from "@/lib/supabase/queries";
import { useSensorDataRealtime } from "./useSensorDataRealtime";

/** Rows from the last N hours for the charts, refreshed every 60 s and on realtime events (throttled). */
export function useLastHours(hours = 1, machineId: string | null = null) {
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastEventAt } = useSensorDataRealtime();
  const lastLoad = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      lastLoad.current = Date.now();
      try {
        const data = await fetchLastHours(hours, machineId);
        if (!cancelled) setRows(data);
      } catch {
        /* keep previous rows */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [hours, machineId]);

  // Realtime nudge, throttled to once per 20 s so a chatty table doesn't hammer the query.
  useEffect(() => {
    if (!lastEventAt || !isSupabaseConfigured()) return;
    if (Date.now() - lastLoad.current < 20_000) return;
    lastLoad.current = Date.now();
    fetchLastHours(hours, machineId).then(setRows).catch(() => {});
  }, [lastEventAt, hours, machineId]);

  return { rows, loading };
}
