import { getSupabaseClient } from "./client";
import { DATA_TABLE } from "@/lib/config";
import type { MachineDataRow } from "./types";

const TABLE = DATA_TABLE;

/** Latest row for a machine (or the latest row overall when machineId is null). */
export async function fetchLatestReading(machineId: string | null): Promise<MachineDataRow | null> {
  const supabase = getSupabaseClient();
  let q = supabase.from(TABLE).select("*");
  if (machineId) q = q.eq("machine_id", machineId);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/** Distinct machine ids seen in the most recent rows (newest machine first). */
export async function fetchMachineIds(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("machine_id")
    .not("machine_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const ids = ((data ?? []) as unknown as { machine_id: string }[]).map((r) => r.machine_id);
  return [...new Set(ids)];
}

/** The N most recent rows for the history table (newest first). */
export async function fetchRecentRows(machineId: string | null, limit = 5): Promise<MachineDataRow[]> {
  const supabase = getSupabaseClient();
  let q = supabase.from(TABLE).select("*");
  if (machineId) q = q.eq("machine_id", machineId);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type SeriesColumn =
  | "vibration_x"
  | "vibration_y"
  | "vibration_z"
  | "surface_temperature_c"
  | "current_a";

/** Historical points for one numeric column. NULLs are excluded, never coerced to 0. */
export async function fetchHistoricalSeries(
  column: SeriesColumn,
  limit = 50,
  machineId: string | null = null
): Promise<{ timestamp: string; value: number }[]> {
  const supabase = getSupabaseClient();
  let q = supabase.from(TABLE).select(`created_at, ${column}`).not(column, "is", null);
  if (machineId) q = q.eq("machine_id", machineId);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.map((r) => ({ timestamp: r.created_at as string, value: r[column] as number })).reverse();
}

export interface ChartRow {
  created_at: string;
  vibration_x: number | null;
  vibration_y: number | null;
  vibration_z: number | null;
  surface_temperature_c: number | null;
  current_a: number | null;
}

const CHART_COLUMNS = "created_at, vibration_x, vibration_y, vibration_z, surface_temperature_c, current_a";
// PostgREST returns at most 1000 rows per request, so the window is fetched in pages.
const PAGE_SIZE = 1000;

/** All rows from the last `hours` hours (oldest first). */
export async function fetchLastHours(hours = 1, machineId: string | null = null, maxRows = 8000): Promise<ChartRow[]> {
  const supabase = getSupabaseClient();
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const out: ChartRow[] = [];
  for (let from = 0; from < maxRows; from += PAGE_SIZE) {
    let q = supabase.from(TABLE).select(CHART_COLUMNS).gte("created_at", since);
    if (machineId) q = q.eq("machine_id", machineId);
    const { data, error } = await q
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as unknown as ChartRow[];
    out.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return out;
}
