import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function CoursePage({ params }: any) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { slug } = await params;

  // 1. Kurs laden
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) {
    return <div className="p-10 text-red-400">Kurs nicht gefunden.</div>;
  }

  // 2. Module laden
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("position");

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-24">
      {/* Header */}
      <header>
        <p className="text-xs text-[#d8a5d0] uppercase tracking-[0.25em]">
          Kurs
        </p>
        <h1 className="text-3xl font-bold tracking-wide">{course.title}</h1>
        <p className="text-gray-300 mt-2">{course.description}</p>
      </header>

      {/* Module-Liste */}
      <section className="space-y-6">
        {modules?.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4"
          >
            <div>
              <h2 className="text-xl font-semibold">{mod.title}</h2>
              <p className="text-gray-400">{mod.description}</p>
            </div>

            {/* Lessons laden */}
            <ModuleLessons moduleId={mod.id} />
          </div>
        ))}
      </section>
    </div>
  );
}

/* -------------------------------
   SERVER COMPONENT: Lessons
-------------------------------- */
async function ModuleLessons({ moduleId }: { moduleId: string }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("position");

  return (
    <div className="space-y-3">
      {lessons?.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/academy/lesson/${lesson.id}`}
          className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#d8a5d0] transition-colors"
        >
          <p className="font-medium">{lesson.title}</p>
          <p className="text-sm text-gray-400">{lesson.description}</p>
        </Link>
      ))}
    </div>
  );
}
