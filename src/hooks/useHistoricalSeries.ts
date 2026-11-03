"use client";

import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchHistoricalSeries, type SeriesColumn } from "@/lib/supabase/queries";
import { formatNormalizedError, normalizeSupabaseError } from "@/lib/supabase/errors";
import { useSensorDataRealtime } from "./useSensorDataRealtime";

type Column = SeriesColumn;

interface Point {
  timestamp: string;
  value: number;
}

/**
 * The 30s interval is a safety-net poll only. Each chart also calls
 * useSensorDataRealtime(), which shares ONE underlying websocket channel
 * across all chart instances (see realtimeBus.ts) — mounting several charts
 * does not open several sockets.
 */
export function useHistoricalSeries(column: Column, limit = 50, machineId: string | null = null) {
  const [points, setPoints] = useState<Point[]>([]);
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
        const data = await fetchHistoricalSeries(column, limit, machineId);
        if (!cancelled) {
          setPoints(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatNormalizedError(normalizeSupabaseError(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [column, limit, machineId]);

  // Immediate refetch on realtime event, independent of the poll above.
  useEffect(() => {
    if (isFirstEvent.current) {
      isFirstEvent.current = false;
      return;
    }
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    fetchHistoricalSeries(column, limit, machineId)
      .then((data) => {
        if (!cancelled) setPoints(data);
      })
      .catch((err) => {
        if (!cancelled) setError(formatNormalizedError(normalizeSupabaseError(err)));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEventAt]);

  return { points, loading, error };
}
