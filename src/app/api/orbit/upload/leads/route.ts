import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { leads } = await req.json();

    if (!Array.isArray(leads))
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    // ONE Auth
    const supabaseOne = createServerClient(
      process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
      {
        cookies: { get: (name) => req.cookies.get(name)?.value },
      }
    );

    const {
      data: { session },
    } = await supabaseOne.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Leads erweitern: owner = eingeloggter User
    const enriched = leads.map((l) => ({
      ...l,
      owner: session.user.id,
    }));

    const { data, error } = await supabaseOrbitAdmin
      .from("leads")
      .insert(enriched)
      .select();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json(
      { inserted: data.length, data },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
