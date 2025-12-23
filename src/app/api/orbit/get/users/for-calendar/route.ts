// src/app/api/orbit/get/users/for-calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => (await cookieStore).get(name)?.value,
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Authenticated user:", user.id);

  // eigene users.id holen
  const { data: me } = await supabaseOrbitAdmin
    .from("users")
    .select("id, first_name, last_name")
    .eq("auth_id", user.id)
    .single();

  if (!me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // alle Downline-User
  const { data: allUsers } = await supabaseOrbitAdmin
    .from("users")
    .select("id, leader, first_name, last_name");

  const result = new Set<string>();
  const stack = [me.id];

  while (stack.length) {
    const cur = stack.pop()!;
    if (result.has(cur)) continue;
    result.add(cur);

    allUsers
      ?.filter((u) => u.leader === cur)
      .forEach((u) => stack.push(u.id));
  }

  const list = allUsers
  ?.filter((u) => result.has(u.id) && u.id !== me.id)
  .map((u) => ({
    label:
      `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.id,
    value: u.id,
  }));



  return NextResponse.json({
    users: [{ label: "Ich", value: me.id }, ...(list ?? [])],
  });
}
