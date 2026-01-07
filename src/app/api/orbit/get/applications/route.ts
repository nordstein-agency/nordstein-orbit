/*

// src/app/api/orbit/get/applications/route.ts
import { NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseOrbitAdmin
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


*/



// src/app/api/orbit/get/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const authId = req.nextUrl.searchParams.get("auth_id");

    if (!authId) {
      return NextResponse.json(
        { error: "Missing auth_id" },
        { status: 400 }
      );
    }

    // 1️⃣ auth_id → users.id
    const { data: me } = await supabaseOrbitAdmin
      .from("users")
      .select("id")
      .eq("auth_id", authId)
      .single();

    if (!me) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2️⃣ alle users (für Downline)
    const { data: allUsers } = await supabaseOrbitAdmin
      .from("users")
      .select("id, leader");

    if (!allUsers) {
      return NextResponse.json(
        { error: "Users load failed" },
        { status: 500 }
      );
    }

    // 3️⃣ Downline sammeln
    const result = new Set<string>();
    const stack = [me.id];

    while (stack.length) {
      const current = stack.pop()!;
      if (result.has(current)) continue;

      result.add(current);

      const children = allUsers.filter(
        (u) => u.leader === current
      );

      for (const child of children) {
        stack.push(child.id);
      }
    }

    const userIds = Array.from(result);

    // 4️⃣ Applications filtern
    const { data, error } = await supabaseOrbitAdmin
      .from("applications")
      .select("*")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
