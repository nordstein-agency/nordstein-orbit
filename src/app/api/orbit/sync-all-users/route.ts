import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ONE → zentrale User-Datenbank
const one = createClient(
  process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
  process.env.ONE_SUPABASE_SERVICE_ROLE_KEY!
);

// ORBIT → RLS geschützte Datenbank
const orbit = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // 1️⃣ Alle One-User laden
    const { data: oneUsers, error: oneErr } = await one
      .from("users")
      .select("auth_id, first_name, last_name, email, role, leader");

    if (oneErr) {
      return NextResponse.json({ error: oneErr.message }, { status: 500 });
    }

    if (!oneUsers || oneUsers.length === 0) {
      return NextResponse.json(
        { error: "No users found in ONE" },
        { status: 404 }
      );
    }

    // 2️⃣ Orbit users laden (für Mapping)
    const { data: orbitUsers } = await orbit
      .from("users")
      .select("id, auth_id");

    const authToOrbitId: Record<string, string> = {};

    orbitUsers?.forEach((u) => {
      authToOrbitId[u.auth_id] = u.id;
    });

    let inserted = 0;
    let updated = 0;

    // 3️⃣ Alle User INSERT oder UPDATE
    for (const u of oneUsers) {
      const existingOrbitId = authToOrbitId[u.auth_id];

      if (existingOrbitId) {
        // UPDATE
        const { error: updateErr } = await orbit
          .from("users")
          .update({
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            role: u.role,
          })
          .eq("id", existingOrbitId);

        if (!updateErr) updated++;
        continue;
      }

      // INSERT
      const { data: insertedRow, error: insertErr } = await orbit
        .from("users")
        .insert({
          auth_id: u.auth_id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: u.role,
        })
        .select("id")
        .single();

      if (insertErr) continue;

      authToOrbitId[u.auth_id] = insertedRow.id;
      inserted++;
    }

    // 4️⃣ Leader korrekt setzen (zweiter Durchgang)
    for (const u of oneUsers) {
      if (!u.leader) continue;

      const orbitId = authToOrbitId[u.auth_id];
      const leaderOrbitId = authToOrbitId[u.leader];

      if (!orbitId || !leaderOrbitId) continue;

      await orbit
        .from("users")
        .update({ leader: leaderOrbitId })
        .eq("id", orbitId);
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated,
      total: oneUsers.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
