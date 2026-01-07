import { NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { application_id, new_user_id, changed_by } = await req.json();

  if (!application_id || !new_user_id || !changed_by) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const { error } = await supabaseOrbitAdmin
    .from("applications")
    .update({ user_id: new_user_id })
    .eq("id", application_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
