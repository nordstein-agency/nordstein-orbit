// Nordstein One Auth-Projekt

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!
  );
}
