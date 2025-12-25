// src/app/api/orbit/get/followup/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1️⃣ application_followups versuchen
  const { data: appFU } = await supabaseOrbitAdmin
    .from("application_followups")
    .select("id, date, note, done, user_id, application_id")
    .eq("id", id)
    .single();

  if (appFU) {
    return NextResponse.json({
      source: "application",
      followup: {
        id: appFU.id,
        date: appFU.date,
        note: appFU.note,
        done: appFU.done,
        user_id: appFU.user_id,
        source_id: appFU.application_id,
      },
    });
  }

  // 2️⃣ lead_followups versuchen
  const { data: leadFU } = await supabaseOrbitAdmin
    .from("lead_followups")
    .select("id, date, note, done, user_id, lead_id")
    .eq("id", id)
    .single();

  if (leadFU) {
    return NextResponse.json({
      source: "lead",
      followup: {
        id: leadFU.id,
        date: leadFU.date,
        note: leadFU.note,
        done: leadFU.done,
        user_id: leadFU.user_id,
        source_id: leadFU.lead_id,
      },
    });
  }

  return NextResponse.json(
    { error: "Follow-Up not found" },
    { status: 404 }
  );
}
