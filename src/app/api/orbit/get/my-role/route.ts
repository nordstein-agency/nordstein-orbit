import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authId = searchParams.get("auth_id");

    if (!authId) {
      return NextResponse.json({ error: "Missing auth_id" }, { status: 400 });
    }

    const { data, error } = await supabaseOrbitAdmin
      .from("users")
      .select("role")
      .eq("auth_id", authId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ role: data?.role ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
