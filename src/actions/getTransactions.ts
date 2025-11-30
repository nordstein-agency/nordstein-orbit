"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieAdapter,
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("orbit_credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
