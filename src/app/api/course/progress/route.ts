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
        get(name: string) {
          return cookieStore.get(name)?.value ?? "";
        },
        set() {},
        remove() {},
      },
    }
  );

  // 1️⃣ USER LADEN
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // 2️⃣ PRÜFEN, OB ES SCHON EINEN PROGRESS-EINTRAG GIBT
  const { data: existing, error: existingError } = await supabase
    .from("user_lesson_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();

  if (existingError) {
    console.error("Progress-Check Fehler:", existingError);
  }

  // 3️⃣ WENN BEREITS EINTRAG EXISTIERT → NICHTS MACHEN
  if (existing) {
    return NextResponse.json({ ok: true, status: "already_exists" });
  }

  // 4️⃣ ERSTEN EINTRAG ANLEGEN (completed = false)
  await supabase.from("user_lesson_progress").insert({
    user_id: user.id,
    lesson_id,
    completed: false,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, status: "created" });
}
