import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr"; // für ONE Auth

export async function GET(req: NextRequest) {
  // -------------------------------
  // 1) ONE AUTH SESSION PRÜFEN
  // -------------------------------
  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value
      }
    }
  );

  const {
    data: { session },
  } = await supabaseOne.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // --------------------------------
  // 2) LEADS AUS ORBIT SUPABASE LADEN
  // --------------------------------
  const { data, error } = await supabaseOrbitAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Orbit Supabase Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json(data);
}
