"use client";

import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchRecentRows } from "@/lib/supabase/queries";
import type { MachineDataRow } from "@/lib/supabase/types";
import { formatNormalizedError, normalizeSupabaseError } from "@/lib/supabase/errors";
import { useSensorDataRealtime } from "./useSensorDataRealtime";

/**
 * Latest rows for the history table. pollMs is a SAFETY-NET interval; the shared
 * realtime bus triggers an immediate refetch on every INSERT/UPDATE.
 */
export function useRecentRecords(machineId: string | null, limit = 5, pollMs = 20000) {
  const [records, setRecords] = useState<MachineDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastEventAt } = useSensorDataRealtime();
  const isFirstEvent = useRef(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabase not configured");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const rows = await fetchRecentRows(machineId, limit);
        if (cancelled) return;
        setRecords(rows);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(formatNormalizedError(normalizeSupabaseError(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [machineId, limit, pollMs]);

  useEffect(() => {
    if (isFirstEvent.current) {
      isFirstEvent.current = false;
      return;
    }
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    fetchRecentRows(machineId, limit)
      .then((rows) => { if (!cancelled) setRecords(rows); })
      .catch((err) => { if (!cancelled) setError(formatNormalizedError(normalizeSupabaseError(err))); });
    return () => { cancelled = true; };
  }, [lastEventAt, machineId, limit]);

  return { records, loading, error };
}
