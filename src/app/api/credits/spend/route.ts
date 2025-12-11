export const runtime = "nodejs";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { spendCredit } from "@/lib/orbit/spendCredit";

export async function POST(req: Request) {
  // Cookies von ONE Supabase
  const cookieStore = await cookies();

  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabaseOne.auth.getUser();

  if (!user) {
    return new Response("Not authenticated", { status: 401 });
  }

  // Orbit Credits abbuchen
  const result = await spendCredit(supabaseOrbitAdmin, user.id, 1);

  if (result.error) {
    return new Response(result.error, { status: 403 });
  }

  return Response.json(result);
}
