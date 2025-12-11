"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function getTransactions() {
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

  // 1️⃣ Auth über ONE
  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );

  const {
    data: { user },
  } = await supabaseOne.auth.getUser();

  if (!user) return [];

  // 2️⃣ Orbit: Transaktionen laden
  const { data, error } = await supabaseOrbitAdmin
    .from("orbit_credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return data ?? [];
}
