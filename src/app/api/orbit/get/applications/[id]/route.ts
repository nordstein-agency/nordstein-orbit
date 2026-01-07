/*

// src/app/api/orbit/get/applications/%5Bid%5D/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing application id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseOrbitAdmin
      .from("applications")
      .select(
        `
        id,
        created_at,
        name,
        birth_year,
        location,
        email,
        phone,
        experience,
        status
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


*/



/*

// src/app/api/orbit/get/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const authId = req.nextUrl.searchParams.get("auth_id");

    if (!id || !authId) {
      return NextResponse.json(
        { error: "Missing id or auth_id" },
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

    // 2️⃣ Bewerbung laden (inkl. user_id!)
    const { data: application } = await supabaseOrbitAdmin
      .from("applications")
      .select(
        `
        id,
        created_at,
        name,
        birth_year,
        location,
        email,
        phone,
        experience,
        status,
        user_id
      `
      )
      .eq("id", id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Alle Users für Downline holen
    const { data: allUsers } = await supabaseOrbitAdmin
      .from("users")
      .select("id, leader");

    if (!allUsers) {
      return NextResponse.json(
        { error: "Users load failed" },
        { status: 500 }
      );
    }

    // 4️⃣ Downline sammeln
    const allowed = new Set<string>();
    const stack = [me.id];

    while (stack.length) {
      const current = stack.pop()!;
      if (allowed.has(current)) continue;

      allowed.add(current);

      const children = allUsers.filter(
        (u) => u.leader === current
      );

      for (const child of children) {
        stack.push(child.id);
      }
    }

    // 5️⃣ Zugriff prüfen
    if (!allowed.has(application.user_id)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 6️⃣ user_id aus Response entfernen
    const { user_id, ...safeApplication } = application;

    return NextResponse.json(safeApplication);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


*/



import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const authId = req.nextUrl.searchParams.get("auth_id");

  if (!id || !authId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { data: me } = await supabaseOrbitAdmin
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (!me) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: application } = await supabaseOrbitAdmin
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: users } = await supabaseOrbitAdmin
    .from("users")
    .select("id, first_name, last_name, leader");

  const allowed = new Set<string>();
  const stack = [me.id];

  while (stack.length) {
    const current = stack.pop()!;
    if (allowed.has(current)) continue;
    allowed.add(current);

    users
      ?.filter((u) => u.leader === current)
      .forEach((u) => stack.push(u.id));
  }

  if (!allowed.has(application.user_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assigned = users?.find((u) => u.id === application.user_id);

  return NextResponse.json({
    ...application,
    assigned_user: assigned
      ? {
          id: assigned.id,
          name: `${assigned.first_name} ${assigned.last_name}`,
        }
      : null,
    possible_assignees: users
      ?.filter((u) => allowed.has(u.id))
      .map((u) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
      })),
  });
}
