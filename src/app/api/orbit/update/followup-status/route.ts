// src/app/api/orbit/update/followup-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const {
      followup_id,
      source,
      source_id,
      user_id,
      status,
      follow_up,
      appointment,
    } = await req.json();

    const followupTable =
      source === "application" ? "application_followups" : "lead_followups";

    /* 1️⃣ Follow-Up abschließen */
    await supabaseOrbitAdmin
      .from(followupTable)
      .update({ done: true })
      .eq("id", followup_id);









    /* 2️⃣ Neues Follow-Up (bei Rückruf / nicht erreicht) */
    if (status === "Erreicht, nochmals kontaktieren" || status === "Nicht erreicht") {
      await supabaseOrbitAdmin.from(followupTable).insert({
        user_id,
        [source === "application" ? "application_id" : "lead_id"]: source_id,
        date: follow_up?.date ?? null,
        note: follow_up?.note ?? null,
        status,
        done: false,
      });
    }










    /* 3️⃣ TERMIN ERSTELLEN */
    if (status === "Termin vereinbart") {
      

        // 🔹 Titel für Kalendereintrag ermitteln (Application oder Lead)
let calendarTitle = "Termin";

if (source === "application") {
  const { data: application } = await supabaseOrbitAdmin
    .from("applications")
    .select("name")
    .eq("id", source_id)
    .single();

  if (application?.name) {
    calendarTitle = application.name;
  }
}

if (source === "lead") {
  const { data: lead } = await supabaseOrbitAdmin
    .from("leads")
    .select("company_name")
    .eq("id", source_id)
    .single();

  if (lead?.company_name) {
    calendarTitle = lead.company_name;
  }
}


      await supabaseOrbitAdmin.from("orbit_calendar_events").insert({
        user_id,
        starts_at: appointment.starts_at,
        ends_at: appointment.ends_at,

        title: calendarTitle,
        type: appointment.type === "Verkaufsgespräch" ? "VK" : "VG",
        location:
          appointment.locationType === "online"
            ? null
            : appointment.locationValue ?? null,
        notes: follow_up?.note ?? null,
        source,
        source_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("FOLLOWUP ERROR", e);
    return NextResponse.json(
      { error: e.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
