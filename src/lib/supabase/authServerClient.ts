import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseAuth() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,      // 🔥 One Auth Projekt
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!, // 🔥 One Auth Key
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({
            name,
            value,
            ...options,
            domain: ".nordstein-agency.com",
            path: "/",
            sameSite: "lax",
          });
        },
        remove(name: string, options: any) {
          cookieStore.set({
            name,
            value: "",
            ...options,
            domain: ".nordstein-agency.com",
            path: "/",
            maxAge: 0,
          });
        },
      },
    }
  );
}
