-- Matrix MachineSense AI — Supabase schema (PROPOSED; adjust to match your ESP32-C6 firmware)
-- Run in the Supabase SQL editor. Column names must match src/lib/supabase/types.ts.

create table if not exists public.machine_data (
  id                    bigint generated always as identity primary key,
  created_at            timestamptz not null default now(),
  machine_id            text,              -- e.g. 'CNC-01', 'PUMP-02'
  machine_status        text,              -- text reported by the device: running / idle / stopped / fault
  vibration_x           double precision,  -- unit set in src/lib/config.ts (UNITS.vibration, default g)
  vibration_y           double precision,
  vibration_z           double precision,
  surface_temperature_c double precision,  -- °C
  current_a             double precision,  -- A
  runtime_seconds       bigint             -- runtime counter, seconds
);

create index if not exists machine_data_machine_created_idx
  on public.machine_data (machine_id, created_at desc);

-- The dashboard only READS with the public anon key, so allow SELECT only.
alter table public.machine_data enable row level security;
drop policy if exists "anon can read machine_data" on public.machine_data;
create policy "anon can read machine_data" on public.machine_data for select to anon using (true);

-- Writing: the ESP32-C6 needs its own insert permission (e.g. a dedicated policy/role or an
-- Edge Function). Do NOT put a service_role key in this dashboard or in any NEXT_PUBLIC_ variable.

-- Live updates (optional; the dashboard falls back to polling without it):
alter publication supabase_realtime add table public.machine_data;
