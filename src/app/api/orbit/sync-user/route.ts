import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // 🔐 Clients NUR ZUR RUNTIME bauen
    const one = createClient(
      process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
      process.env.SUPABASE_ONE_SERVICE_ROLE_KEY!
    );

    const orbit = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { auth_id } = await req.json();

    if (!auth_id) {
      return NextResponse.json({ error: "Missing auth_id" }, { status: 400 });
    }

    // 1️⃣ ONE USER LADEN
    const { data: oneUser, error: oneError } = await one
      .from("users")
      .select("id, first_name, last_name, email, role, leader")
      .eq("auth_id", auth_id)
      .single();

    if (oneError || !oneUser) {
      return NextResponse.json({ error: "ONE user not found" }, { status: 404 });
    }

    // 2️⃣ ORBIT EXISTENZ PRÜFEN
    const { data: orbitExisting, error: orbitSelectError } = await orbit
      .from("users")
      .select("id")
      .eq("auth_id", auth_id)
      .single();

    if (orbitSelectError && orbitSelectError.code !== "PGRST116") {
      return NextResponse.json(
        { error: orbitSelectError.message },
        { status: 500 }
      );
    }

    const orbitId = orbitExisting?.id ?? null;

    // 3️⃣ LEADER MAPPING
    let leaderOrbitId: string | null = null;

    if (oneUser.leader) {
      const { data: leaderOrbit } = await orbit
        .from("users")
        .select("id")
        .eq("auth_id", oneUser.leader)
        .single();

      if (leaderOrbit) {
        leaderOrbitId = leaderOrbit.id;
      }
    }

    // 4️⃣ INSERT ODER UPDATE
    if (!orbitId) {
      const { data: insertData, error: insertError } = await orbit
        .from("users")
        .insert({
          auth_id,
          id: oneUser.id,
          first_name: oneUser.first_name,
          last_name: oneUser.last_name,
          email: oneUser.email,
          role: oneUser.role,
          leader: leaderOrbitId,
        })
        .select("id")
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        orbit_id: insertData.id,
      });
    }

    // Update
    const { data: updateData, error: updateError } = await orbit
      .from("users")
      .update({
        
        first_name: oneUser.first_name,
        last_name: oneUser.last_name,
        email: oneUser.email,
        role: oneUser.role,
        leader: leaderOrbitId,
      })
      .eq("id", orbitId)
      .select("id")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orbit_id: updateData.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
