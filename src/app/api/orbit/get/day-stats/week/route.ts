// src/app/api/orbit/get/day-stats/week/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { startOfWeek, addDays, format } from "date-fns";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);

  const requestedUserId =
  req.nextUrl.searchParams.get("user_id");


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
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --------------------------------------------------
  // 2️⃣ Eigene users.id holen
  // --------------------------------------------------
  const { data: me, error: meError } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (meError || !me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // --------------------------------------------------
  // 3️⃣ Downline DIREKT berechnen (KEIN fetch!)
  // --------------------------------------------------
  const { data: allUsers, error: usersError } = await supabaseOrbitAdmin
    .from("users")
    .select("id, leader");

  if (usersError || !allUsers) {
    return NextResponse.json({ error: "Users load failed" }, { status: 500 });
  }

  const userIdSet = new Set<string>();
  
  const rootUserId = requestedUserId || me.id;
const stack = [rootUserId];


  while (stack.length > 0) {
    const current = stack.pop()!;
    if (userIdSet.has(current)) continue;

    userIdSet.add(current);

    allUsers
      .filter((u) => u.leader === current)
      .forEach((u) => stack.push(u.id));
  }

  const userIds = Array.from(userIdSet);

  if (userIds.length === 0) {
    return NextResponse.json({ statsByDay: {} });
  }

  // --------------------------------------------------
  // 4️⃣ Woche berechnen
  // --------------------------------------------------
  const base = new Date();
  const weekStart = startOfWeek(addDays(base, offset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = addDays(weekStart, 7);

  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  // --------------------------------------------------
  // 5️⃣ Day-Stats laden
  // --------------------------------------------------
  const { data, error } = await supabaseOrbitAdmin
    .from("orbit_day_stats")
    .select("*")
    .in("user_id", userIds)
    .gte("date", startDate)
    .lt("date", endDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --------------------------------------------------
  // 6️⃣ Nach Datum gruppieren
  // --------------------------------------------------
  const map: Record<string, any[]> = {};

  for (const row of data ?? []) {
    if (!map[row.date]) map[row.date] = [];
    map[row.date].push(row);
  }

  return NextResponse.json({ statsByDay: map });
}
