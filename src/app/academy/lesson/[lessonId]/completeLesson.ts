"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function completeLessonServer(lessonId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // USER HOLEN
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // LESSON COMPLETE = TRUE
  await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

  console.log("Lesson completed:", lessonId);
}
