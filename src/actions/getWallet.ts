"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function getWallet() {
  const cookieStore = await cookies();

  const cookieAdapter = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options: any) => {
      cookieStore.set({ name, value, ...options });
    },
    remove: (name: string, options: any) => {
      cookieStore.set({
        name,
        value: "",
        ...options,
        maxAge: 0,
      });
    },
  };

  // 1️⃣ ONE AUTH prüfen
  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );

  const {
    data: { user },
  } = await supabaseOne.auth.getUser();

  if (!user) return null;

  // 2️⃣ Orbit: Credits auslesen
  const { data, error } = await supabaseOrbitAdmin
    .from("orbit_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  return data;
}
