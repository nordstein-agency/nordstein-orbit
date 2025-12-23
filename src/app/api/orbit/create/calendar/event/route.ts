// src/app/api/orbit/create/calendar/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    user_id,
    title,
    starts_at,
    ends_at,
    location,
    notes,
    type,
    meeting_link,
  } = body;

  if (!user_id || !title || !starts_at || !ends_at) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await supabaseOrbitAdmin
    .from("orbit_calendar_events")
    .insert({
      user_id,
      title,
      type: type ?? "Termin",
      starts_at,
      ends_at,
      location,
      notes,
        meeting_link,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
