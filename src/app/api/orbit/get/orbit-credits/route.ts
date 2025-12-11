import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  // -----------------------------
  // 1️⃣ Cookies für ONE Auth
  // -----------------------------
  const cookieAdapter = {
    get: (name: string) => req.cookies.get(name)?.value,
  };

  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );

  // -----------------------------
  // 2️⃣ Session prüfen
  // -----------------------------
  const {
    data: { session },
  } = await supabaseOne.auth.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // -----------------------------
  // 3️⃣ Orbit Credits für diesen User abfragen
  // -----------------------------
  const { data, error } = await supabaseOrbitAdmin
    .from("orbit_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Credits not found" },
      { status: 404 }
    );
  }

  // -----------------------------
  // 4️⃣ Erfolgreiche Antwort
  // -----------------------------
  return NextResponse.json(
    { credits: data.credits ?? 0 },
    { status: 200 }
  );
}
