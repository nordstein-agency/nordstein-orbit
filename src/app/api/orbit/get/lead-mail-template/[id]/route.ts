import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest, ctx: any) {
  // 🔥 FIX für Next.js 16 → params ist ein Promise
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  // ONE Auth check
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lead-Mail-Template abrufen
  const { data, error } = await supabaseOrbitAdmin
    .from("lead_mail_templates")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // 🔥 .single() wirft Fehler wenn nichts existiert

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? null);
}
