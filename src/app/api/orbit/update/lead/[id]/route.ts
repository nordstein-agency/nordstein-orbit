import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseOrbitAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();

  // ONE Auth prüfen
  const cookieStore = req.cookies;

  const supabaseOne = createServerClient(
    process.env.NEXT_PUBLIC_ONE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ONE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  const {
    data: { session },
  } = await supabaseOne.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Orbit Update
  const { error } = await supabaseOrbitAdmin
    .from("leads")
    .update(body)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
