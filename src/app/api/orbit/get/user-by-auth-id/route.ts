// src/app/api/orbit/get/user-by-auth-id/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const authId = req.nextUrl.searchParams.get("auth_id");

  if (!authId) {
    return NextResponse.json(
      { error: "Missing auth_id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
