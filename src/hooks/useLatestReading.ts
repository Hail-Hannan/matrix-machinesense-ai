"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchLatestReading } from "@/lib/supabase/queries";
import type { MachineDataRow } from "@/lib/supabase/types";
import { formatNormalizedError, normalizeSupabaseError } from "@/lib/supabase/errors";
import { useSensorDataRealtime } from "./useSensorDataRealtime";
import type { ChannelState } from "@/lib/supabase/realtimeBus";

/**
 * `connectionState` reflects the shared Realtime WEBSOCKET only.
 * `queryStatus` reflects whether the actual REST SELECT against machine_data has
 * succeeded. These are DELIBERATELY separate — a websocket can subscribe
 * successfully while the REST query is blocked (e.g. by RLS) or failing.
 */
export type { ChannelState } from "@/lib/supabase/realtimeBus";
export type QueryStatus = "idle" | "loading" | "success" | "error";

interface UseLatestReadingResult {
  data: MachineDataRow | null;
  connectionState: ChannelState;
  queryStatus: QueryStatus;
  error: string | null;
  refresh: () => void;
}

// Always-on safety-net poll. Realtime is the primary update mechanism; this
// interval exists purely as a fallback in case an event is missed.
const POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS ?? 15000);

export function useLatestReading(machineId: string | null): UseLatestReadingResult {
  const [data, setData] = useState<MachineDataRow | null>(null);
  const [queryStatus, setQueryStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { lastEventAt, channelState } = useSensorDataRealtime();
  const isFirstEvent = useRef(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setQueryStatus((prev) => (prev === "idle" ? "loading" : prev));
    try {
      setData(await fetchLatestReading(machineId));
      setError(null);
      setQueryStatus("success");
    } catch (err) {
      setError(formatNormalizedError(normalizeSupabaseError(err)));
      setQueryStatus("error");
    }
  }, [machineId]);

  // Load on mount and whenever the selected machine changes.
  useEffect(() => {
    load();
  }, [load]);

  // Immediate refetch on every realtime event (skip the initial 0).
  useEffect(() => {
    if (isFirstEvent.current) {
      isFirstEvent.current = false;
      return;
    }
    load();
  }, [lastEventAt, load]);

  useEffect(() => {
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  return { data, connectionState: channelState, queryStatus, error, refresh: load };
}
