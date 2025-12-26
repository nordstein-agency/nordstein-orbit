import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const authUserId = body?.auth_user_id;

  if (!authUserId) {
    return NextResponse.json({ error: "missing auth_user_id" }, { status: 400 });
  }

  // 🔒 Optional minimal sanity check (kannst du auch weglassen)
  // z. B. prüfen, ob auth_id existiert
  const { data: userRow } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authUserId)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const userId = userRow.id;

  // 🔑 Token holen oder erzeugen
  const { data: existing } = await supabaseOrbitAdmin
    .from("calendar_ics_tokens")
    .select("token")
    .eq("user_id", userId)
    .single();

  const token = existing?.token ?? randomUUID();

  if (!existing) {
    await supabaseOrbitAdmin
      .from("calendar_ics_tokens")
      .insert({ user_id: userId, token });
  }

  return NextResponse.json({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/ics/${token}.ics`,
  });
}
