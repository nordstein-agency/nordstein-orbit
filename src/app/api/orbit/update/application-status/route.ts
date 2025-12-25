// src/app/api/orbit/update/application-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { use } from "react";
import { businessLocalToUtc } from "@/lib/orbit/timezone";
import { addMinutesISO } from "@/lib/orbit/time/addMinutes";
import { source } from "framer-motion/client";


export async function POST(req: NextRequest) {
  try {
    // --------------------------------------------------
    // 1️⃣ Body parsen (INKL. user_id)
    // --------------------------------------------------
    const body = await req.json();

    const {
      id,
      status,
      user_id,
      follow_up,
    }: {
      id: string;
      status: string;
      user_id: string; // 👈 KOMMT DIREKT VOM FRONTEND
      follow_up?: {
        appointmentType?: string;
        followUpDate?: string;
        followUpTime?: string;
        followUpDuration?: string;
        followUpNote?: string;
        locationType?: "office" | "online" | "other";
        locationValue?: string;
      };
    } = body;

    if (!id || !status || !user_id) {
      return NextResponse.json(
        { error: "Missing id, status or user_id" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2️⃣ Status in applications updaten
    // --------------------------------------------------
    const { error: updateError } = await supabaseOrbitAdmin
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }






    // --------------------------------------------------
    // 3️⃣ TERMIN VEREINBART → NUR KALENDER
    // --------------------------------------------------


    if (
      status === "Termin vereinbart" &&
      follow_up?.followUpDate &&
      follow_up?.followUpTime &&
      follow_up?.appointmentType
    ) {

        
      const startsAt = businessLocalToUtc(
  `${follow_up.followUpDate} ${follow_up.followUpTime}`
);

const endsAt = addMinutesISO(
  startsAt.toISOString(),
  Number(follow_up.followUpDuration ?? 60)
);


    // 🔹 Bewerbungsname für Kalendertitel laden
    const { data: application } = await supabaseOrbitAdmin
    .from("applications")
    .select("name")
    .eq("id", id)
    .single();

    const calendarTitle = application?.name ?? "Bewerbung";


      const { error: calendarError } =
        await supabaseOrbitAdmin
          .from("orbit_calendar_events")
          .insert({
            user_id, // ✅ DIREKT VOM FRONTEND
            starts_at: startsAt.toISOString(),
            ends_at: endsAt,
            title: calendarTitle,
            type: follow_up.appointmentType === "Verkaufsgespräch" ? "VK" : "VG",
            location: follow_up.locationValue ?? null,
            notes: follow_up.followUpNote ?? null,
            source: "application",
            source_id: id,
          });

      if (calendarError) {
        return NextResponse.json(
          { error: calendarError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }











    // --------------------------------------------------
    // 4️⃣ ANDERE STATI → FOLLOW-UPS
    // --------------------------------------------------
    const shouldCreateFollowUp =
  status === "Erreicht, nochmals kontaktieren" ||
  status === "Nicht erreicht";

    if (
        shouldCreateFollowUp &&
      follow_up &&
      (follow_up.followUpDate || follow_up.followUpNote)
    ) {

        console.log("FOLLOWUP INSERT", follow_up, user_id, id, status);
      const { error, data } = await supabaseOrbitAdmin
  .from("application_followups")
  .insert({
    user_id,
    application_id: id,
    status,
    date: follow_up.followUpDate ?? null,
    note: follow_up.followUpNote ?? null,
  })
  .select()
  .single();

console.log("FOLLOWUP INSERT RESULT", { data, error });

if (error) {
  return NextResponse.json(
    { error: error.message, details: error },
    { status: 500 }
  );
}

    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
