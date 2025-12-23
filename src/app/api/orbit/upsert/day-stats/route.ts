import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // --------------------------------------------------
  // 1️⃣ Auth (ONE)
  // --------------------------------------------------
  const cookieStore = cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => (await cookieStore).get(name)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --------------------------------------------------
  // 2️⃣ Eigene Orbit-User-ID
  // --------------------------------------------------
  console.log("AUTH USER ID: ", user.id);
  const { data: me, error: meError } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();


   console.log("ORBIT USER RECORD: ", me?.id, meError); 
  if (meError || !me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // --------------------------------------------------
  // 3️⃣ Payload NORMALISIEREN (SEHR WICHTIG)
  // --------------------------------------------------
  const payload = {
  user_id: me.id,
  date: body.date,

  vk: Number(body.vk ?? 0),
  vg: Number(body.vg ?? 0),
  ea: Number(body.ea ?? 0),
  eg: Number(body.eg ?? 0),
  sem: Number(body.sem ?? 0),
  on: Number(body.on ?? 0),
  up: Number(body.up ?? 0),
  pg: Number(body.pg ?? 0),
};


  // --------------------------------------------------
  // 4️⃣ UPSERT
  // --------------------------------------------------
  const { error } = await supabaseOrbitAdmin
    .from("orbit_day_stats")
    .upsert(payload, {
      onConflict: "user_id,date",
    });

  if (error) {
    console.error("DAY-STATS UPSERT ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
