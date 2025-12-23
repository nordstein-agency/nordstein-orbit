import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    starts_at,
    ends_at,
    exclude_event_id,
  }: {
    starts_at: string;
    ends_at: string;
    exclude_event_id?: string;
  } = body;

  if (!starts_at || !ends_at) {
    return NextResponse.json(
      { error: "Missing starts_at or ends_at" },
      { status: 400 }
    );
  }

  let query = supabaseOrbitAdmin
    .from("orbit_calendar_events")
    .select("id, title, starts_at, ends_at, user_id")
    .lt("starts_at", ends_at)
    .gt("ends_at", starts_at);

  // Beim Editieren: eigenen Termin ignorieren
  if (exclude_event_id) {
    query = query.neq("id", exclude_event_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    conflicts: data ?? [],
    count: data?.length ?? 0,
  });
}
