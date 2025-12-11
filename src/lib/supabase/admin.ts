// lib/supabase/orbitAdmin.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseOrbitAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✔ sicher, läuft nur auf Server
);
