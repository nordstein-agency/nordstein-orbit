import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

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
      const startsAt = new Date(
        `${follow_up.followUpDate}T${follow_up.followUpTime}`
      );

      const endsAt = new Date(startsAt);
      endsAt.setMinutes(
        endsAt.getMinutes() +
          Number(follow_up.followUpDuration ?? 60)
      );

      const { error: calendarError } =
        await supabaseOrbitAdmin
          .from("orbit_calendar_events")
          .insert({
            user_id, // ✅ DIREKT VOM FRONTEND
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
            title: follow_up.appointmentType, // z. B. Vorstellungsgespräch
            type: follow_up.appointmentType,
            location: follow_up.locationValue ?? null,
            notes: follow_up.followUpNote ?? null,
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
    if (
      follow_up &&
      (follow_up.followUpDate || follow_up.followUpNote)
    ) {
      await supabaseOrbitAdmin
        .from("application_followups")
        .insert({
          application_id: id,
          status,
          date: follow_up.followUpDate ?? null,
          time: follow_up.followUpTime ?? null,
          note: follow_up.followUpNote ?? null,
        });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
