/**
 * Types for the machine_data table (see supabase/schema.sql).
 *
 * ASSUMPTION: this schema is a PROPOSAL, not yet confirmed against the real
 * ESP32-C6 firmware. If your firmware writes different column names, change them
 * here, in queries.ts, and in schema.sql — nowhere else.
 *
 *  - machine_id            which machine the reading belongs to (text)
 *  - machine_status        text reported by the device, e.g. running / idle / stopped / fault
 *  - vibration_x/y/z       per-axis vibration (unit set in lib/config.ts UNITS)
 *  - surface_temperature_c surface temperature, °C
 *  - current_a             measured current, A
 *  - runtime_seconds       machine runtime counter, seconds
 */
export interface MachineDataRow {
  id: number;
  created_at: string; // timestamptz
  machine_id: string | null;
  machine_status: string | null;
  vibration_x: number | null;
  vibration_y: number | null;
  vibration_z: number | null;
  surface_temperature_c: number | null;
  current_a: number | null;
  runtime_seconds: number | null;
}

export type Database = {
  public: {
    Tables: {
      machine_data: {
        Row: MachineDataRow;
        Insert: Partial<MachineDataRow>;
        Update: Partial<MachineDataRow>;
      };
    };
  };
};
