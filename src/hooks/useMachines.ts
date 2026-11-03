"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchMachineIds } from "@/lib/supabase/queries";

/** Machine ids that have reported data, for the header machine selector. */
export function useMachines(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    const load = () => fetchMachineIds().then((v) => { if (!cancelled) setIds(v); }).catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);
  return ids;
}
