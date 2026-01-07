// src/app/api/orbit/get/user-downline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

/**
 * Gibt alle users.id zurück,
 * die unter dem aktuellen User hängen (inkl. ihm selbst)
 */
export async function GET(req: NextRequest) {
  const authId = req.nextUrl.searchParams.get("auth_id");

  if (!authId) {
    return NextResponse.json({ error: "Missing auth_id" }, { status: 400 });
  }

  // 1️⃣ auth_id → users.id
  const { data: me, error: meError } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (meError || !me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2️⃣ alle users holen (kleine Tabelle, ok)
  const { data: allUsers, error } = await supabaseOrbitAdmin
    .from("users")
    .select("id, leader");

  if (error || !allUsers) {
    return NextResponse.json({ error: "Users load failed" }, { status: 500 });
  }

  // 3️⃣ Downline rekursiv sammeln
  const result = new Set<string>();
  const stack = [me.id];

  while (stack.length > 0) {
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

  return NextResponse.json({
    user_ids: Array.from(result),
  });
}
