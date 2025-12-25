import { NextRequest, NextResponse } from "next/server";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // --------------------------------------------------
    // 1️⃣ user_ids lesen
    // --------------------------------------------------
    const userIdsParam = searchParams.get("user_ids");
    if (!userIdsParam) {
      return NextResponse.json(
        { error: "user_ids is required" },
        { status: 400 }
      );
    }

    const userIds = userIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "user_ids is empty" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2️⃣ Followups laden
    // --------------------------------------------------
    const { data: followups, error: fuError } =
      await supabaseOrbitAdmin
        .from("application_followups")
        .select("id, date, note, done, user_id, created_at")
        .in("user_id", userIds)
        .order("date", { ascending: true });

    if (fuError) {
      return NextResponse.json(
        { error: fuError.message },
        { status: 500 }
      );
    }

    if (!followups || followups.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // --------------------------------------------------
    // 3️⃣ Alle beteiligten User-IDs sammeln
    // --------------------------------------------------
    const uniqueUserIds = Array.from(
      new Set(followups.map((f) => f.user_id))
    );

    // --------------------------------------------------
    // 4️⃣ Users laden
    // --------------------------------------------------
    const { data: users, error: userError } =
      await supabaseOrbitAdmin
        .from("users")
        .select("id, first_name, last_name")
        .in("id", uniqueUserIds);

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 5️⃣ User-Mapping bauen
    // --------------------------------------------------
    const userMap: Record<
      string,
      { id: string; first_name: string | null; last_name: string | null }
    > = {};

    (users ?? []).forEach((u) => {
      userMap[u.id] = u;
    });

    // --------------------------------------------------
    // 6️⃣ UI-fertiges Result
    // --------------------------------------------------
    const result = followups.map((f) => ({
      id: f.id,
      date: f.date,
      note: f.note,
      done: f.done,
      user_id: f.user_id,
      created_at: f.created_at,
      user: userMap[f.user_id] ?? null,
    }));

    return NextResponse.json({ data: result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
