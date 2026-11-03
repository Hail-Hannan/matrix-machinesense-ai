/** Static project identity shown in the header and footer. Edit freely. */
export const PROJECT = {
  product: "MachineSense AI",
  taglineLines: ["Retrofit Machine Solution", "Industrial Machine Monitoring"],
  company: "Matrix IoT Solutions Sdn Bhd",
  footerTagline: ["Smart Monitoring", "Safer People", "Smarter Operations", "A More Resilient Tomorrow"],
};

/** Supabase table the ESP32-C6 devices write to (see supabase/schema.sql). */
export const DATA_TABLE = "machine_data" as const;

/** Display units. Change these if your sensors report different units. */
export const UNITS = { vibration: "g", temperature: "°C", current: "A" } as const;

/** Chart window shown on the dashboard, in hours. */
export const CHART_WINDOW_HOURS = 1;

/**
 * Alert limits per measurement. `null` = no limit set, so the dashboard shows the
 * reading but does NOT claim it is normal or abnormal. Set real limits for your
 * machines (from the machine datasheet / maintenance team) before relying on the
 * health indicators. Vibration limits apply to each axis (absolute value).
 */
export interface Limit { warn: number | null; alarm: number | null }
export const LIMITS: Record<"vibration" | "temperature" | "current", Limit> = {
  vibration: { warn: null, alarm: null },
  temperature: { warn: null, alarm: null },
  current: { warn: null, alarm: null },
};
