import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ONE Auth prüfen
    const supabaseOne = createServerClient(
      process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
        },
      }
    );

    const {
      data: { session },
    } = await supabaseOne.auth.getSession();

    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Owner = der eingeloggte ONE User
    const payload = {
      ...body,
      owner: session.user.id,
    };

    const { data, error } = await supabaseOrbitAdmin
      .from("leads")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
