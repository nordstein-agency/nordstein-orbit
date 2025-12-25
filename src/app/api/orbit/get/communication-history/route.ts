import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const source = searchParams.get("source"); // "application" | "lead"
    const source_id = searchParams.get("source_id");

    if (!source || !source_id) {
      return NextResponse.json(
        { error: "Missing source or source_id" },
        { status: 400 }
      );
    }

    /* ======================================================
       1️⃣ FOLLOW-UPS LADEN
    ====================================================== */
    const followupTable =
      source === "application"
        ? "application_followups"
        : "lead_followups";

    const followupFk =
      source === "application" ? "application_id" : "lead_id";

    const { data: followups, error: followupError } =
      await supabaseOrbitAdmin
        .from(followupTable)
        .select("id, status, note, created_at")
        .eq(followupFk, source_id)
        .order("created_at", { ascending: true });

    if (followupError) {
      return NextResponse.json(
        { error: followupError.message },
        { status: 500 }
      );
    }

    const followupItems = followups.map((f) => ({
  id: f.id,
  type: "followup",
  title: f.status,
  description: f.note,
  created_at: f.created_at,

  // 👇 DAS HIER IST NEU
  timestamp: f.created_at,
}));


    /* ======================================================
       2️⃣ KALENDER-TERMINE LADEN
       (nur Termine, die zu diesem Lead/Bewerbung gehören)
    ====================================================== */
    const { data: events, error: eventError } =
      await supabaseOrbitAdmin
        .from("orbit_calendar_events")
        .select("id, title, notes, starts_at, created_at")
        .eq("source", source)
        .eq("source_id", source_id)
        .order("starts_at", { ascending: true });

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      );
    }

    const calendarItems = events.map((e) => ({
  id: e.id,
  type: "calendar",
  title: e.title,
  description: e.notes,
  created_at: e.created_at,

  // 👇 DAS IST DAS WICHTIGE
  timestamp: e.starts_at ?? e.created_at,
}));


    /* ======================================================
       3️⃣ MERGE + SORT (Timeline)
    ====================================================== */
    const timeline = [...followupItems, ...calendarItems].sort(
  (a, b) =>
    new Date(a.timestamp).getTime() -
    new Date(b.timestamp).getTime()
);


    return NextResponse.json(timeline);
  } catch (err: any) {
    console.error("COMMUNICATION HISTORY ERROR", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
