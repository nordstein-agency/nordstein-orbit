// src/app/api/orbit/get/calendar/week/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { startOfWeek, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);

  const base = new Date();
  const weekStart = startOfWeek(addDays(base, offset * 7), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);

  const { data, error } = await supabaseOrbitAdmin
    .from("orbit_calendar_events")
    .select("*")
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}
