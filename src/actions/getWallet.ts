"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getWallet() {
  // await notwendig weil PROMISE
  const cookieStore = await cookies();

  // wir bauen ein Cookie-Interface das Supabase akzeptiert
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
      cookies: cookieAdapter, // ← jetzt stimmt der Typ
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("orbit_credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  return data;
}
