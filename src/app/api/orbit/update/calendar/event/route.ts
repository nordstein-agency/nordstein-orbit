// src/app/api/orbit/update/calendar/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      title,
      starts_at,
      ends_at,
      location,
      notes,
      type,
      meeting_link
    }: {
      id: string;
      title?: string;
      starts_at?: string;
      ends_at?: string;
      location?: string | null;
      notes?: string | null;
      type?: string;
        meeting_link?: string | null;
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // IMPORTANT:
    // type hat bei euch einen CHECK constraint.
    // Damit es nie crasht: Default immer "Termin".
    const updatePayload: any = {};
    if (typeof title === "string") updatePayload.title = title;
    if (typeof starts_at === "string") updatePayload.starts_at = starts_at;
    if (typeof ends_at === "string") updatePayload.ends_at = ends_at;
    if (location !== undefined) updatePayload.location = location;
    if (notes !== undefined) updatePayload.notes = notes;
    if (meeting_link !== undefined) updatePayload.meeting_link = meeting_link;
    updatePayload.type = type ?? "Termin";

    const { error } = await supabaseOrbitAdmin
      .from("orbit_calendar_events")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
