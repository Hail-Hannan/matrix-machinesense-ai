import { getSupabaseClient, isSupabaseConfigured } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { DATA_TABLE } from "@/lib/config";

/**
 * Singleton Realtime subscription for the machine_data table, shared by every
 * hook that needs to react to new/updated rows (latest reading, charts, history).
 * Multiple components mounting at once never open separate websocket channels —
 * they all share one.
 *
 * Subscribes to both INSERT and UPDATE so that devices which upsert rows are
 * not silently missed. The table must be added to the supabase_realtime
 * publication (see supabase/schema.sql); if it is not, the dashboard still
 * updates through its polling fallback.
 */

export type ChannelState = "connecting" | "realtime" | "polling" | "unconfigured";

type DataListener = () => void;
type StateListener = (state: ChannelState) => void;

let channel: RealtimeChannel | null = null;
let refCount = 0;
let currentState: ChannelState = "connecting";
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

const dataListeners = new Set<DataListener>();
const stateListeners = new Set<StateListener>();

function setState(next: ChannelState) {
  if (currentState === next) return;
  currentState = next;
  stateListeners.forEach((l) => l(next));
}

function notifyData() {
  dataListeners.forEach((l) => l());
}

function ensureChannel() {
  if (channel || !isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();
  setState("connecting");

  channel = supabase
    .channel("machine_data_realtime_bus")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: DATA_TABLE },
      notifyData
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: DATA_TABLE },
      notifyData
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setState("realtime");
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setState("polling");
      }
    });

  // Safety net: if the websocket hasn't confirmed within 6s, tell
  // consumers to rely on their own polling fallback in the meantime.
  fallbackTimer = setTimeout(() => {
    if (currentState === "connecting") setState("polling");
  }, 6000);
}

function teardownChannel() {
  if (channel) {
    getSupabaseClient().removeChannel(channel);
    channel = null;
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
  currentState = "connecting";
}

/** Subscribe to "a machine_data row changed" events. Ref-counted: the
 * underlying channel is only created once and only torn down when the
 * last subscriber unsubscribes. */
export function subscribeToSensorDataEvents(listener: DataListener): () => void {
  if (!isSupabaseConfigured()) return () => {};

  refCount += 1;
  dataListeners.add(listener);
  ensureChannel();

  return () => {
    dataListeners.delete(listener);
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0) {
      teardownChannel();
    }
  };
}

export function subscribeToChannelState(listener: StateListener): () => void {
  stateListeners.add(listener);
  listener(isSupabaseConfigured() ? currentState : "unconfigured");
  return () => stateListeners.delete(listener);
}

export function getChannelState(): ChannelState {
  return isSupabaseConfigured() ? currentState : "unconfigured";
}
