import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest, ctx: any) {
  // ❗ NEXT 16 FIX: params ist ein Promise
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 400 }
    );
  }

  // ---- AUTH via ONE ----
  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabaseOne.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ---- Orbit Lead laden ----
  const { data, error } = await supabaseOrbitAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
