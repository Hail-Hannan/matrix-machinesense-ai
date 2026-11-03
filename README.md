# Matrix MachineSense AI (Retrofit Machine Solution)

Single-screen machine monitoring dashboard for ESP32-C6 retrofit sensors. Built from the
Portable Weather Station dashboard: same stack (Next.js 14, TypeScript, Tailwind, recharts,
`@supabase/supabase-js`), same folder layout, same one-screen layout behaviour (>= 1280 px wide).

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```

## Connect Supabase
1. Run `supabase/schema.sql` in your Supabase project (adjust column names to your firmware).
2. Put the project URL and the **anon/publishable** key in `.env.local`
   (this project commits `.env.local`, like the weather dashboard — so never put a `service_role` key in it).
3. Until then the dashboard shows "Not configured" and `N/A` values. No readings are simulated.

## Set your machine limits
`src/lib/config.ts` → `LIMITS`. All limits are `null` by default, so health indicators read
"No limit set" / "Not evaluated" instead of claiming a machine is normal. The dashboard reports
current readings against your limits; it does not predict failures.

## Where things are
- `src/components/dashboard/` — Header, MachineStatusCard, SensorCard, ChartCard, HealthCard, HistoryCard, DashboardView
- `src/lib/supabase/` — client, queries, realtime bus, types (`machine_data` table)
- `src/lib/config.ts` — project name, units, chart window, limits
- Deploy: push to GitHub and import in Vercel (Next.js preset, no extra settings).
