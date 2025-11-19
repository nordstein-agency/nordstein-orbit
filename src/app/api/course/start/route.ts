import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { course_id, first_lesson_id } = await req.json();

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

  // Hole User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Prüfen ob bereits existiert
  const { data: existing, error: existingError } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existingError) {
    console.log("ExistingError", existingError);
  }

  if (existing) {
    return NextResponse.json({ status: "already_exists" });
  }

  // Erstelle neuen Eintrag
  const { error: insertError } = await supabase
    .from("user_course_progress")
    .insert({
      user_id: user.id,
      course_id,
      completed: false,
    });

  if (insertError) {
    console.error("Insert Error:", insertError);
    return NextResponse.json({ error: insertError }, { status: 400 });
  }

  return NextResponse.json({ status: "created" });
}
