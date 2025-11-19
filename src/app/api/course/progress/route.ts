import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function PATCH(req: Request) {
  const { course_id, lesson_id } = await req.json();

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );

  // 1. User holen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // 2. Bestehenden Progress holen
  const { data: existing } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .maybeSingle();

  // 3. Updaten oder erstellen
  if (existing) {
    await supabase
      .from("user_course_progress")
      .update({
        lesson_id,
        completet: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("user_course_progress").insert({
      user_id: user.id,
      course_id,
      lesson_id,
      completet: false,
    });
  }

  return NextResponse.json({ status: "updated" });
}
