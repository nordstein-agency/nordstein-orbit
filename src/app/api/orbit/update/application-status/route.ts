import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      status,
      follow_up,
    }: {
      id: string;
      status: string;
      follow_up?: {
        appointmentType?: string;
        followUpDate?: string;
        followUpTime?: string;
        followUpDuration?: string;
        followUpNote?: string;
      };
    } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    // ----------------------------
    // 1️⃣ Status in applications updaten
    // ----------------------------
    const { error: updateError } = await supabaseOrbitAdmin
      .from("applications")
      .update({
        status,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // ----------------------------
    // 2️⃣ Optional: Follow-Up speichern
    // ----------------------------
    if (
      follow_up &&
      (follow_up.followUpDate ||
        follow_up.followUpNote ||
        follow_up.appointmentType)
    ) {
      await supabaseOrbitAdmin.from("application_followups").insert({
        application_id: id,
        status,
        appointment_type: follow_up.appointmentType ?? null,
        date: follow_up.followUpDate ?? null,
        time: follow_up.followUpTime ?? null,
        duration_minutes: follow_up.followUpDuration
          ? Number(follow_up.followUpDuration)
          : null,
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
