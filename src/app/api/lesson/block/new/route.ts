import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

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

  // Position berechnen
  const { data: lastBlock } = await supabase
    .from("lesson_blocks")
    .select("position")
    .eq("lesson_id", body.lessonId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = lastBlock?.position ? lastBlock.position + 1 : 1;

  const { data, error } = await supabase.from("lesson_blocks").insert({
    lesson_id: body.lessonId,
    type: body.type,
    content: body.content,
    position: nextPosition,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
