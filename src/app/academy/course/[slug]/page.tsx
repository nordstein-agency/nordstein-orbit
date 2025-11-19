import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import ProgressBar from "@/components/academy/lesson/ProgressBar";
import StartCourseButton from "@/components/academy/course/StartCourseButton";

export default async function CoursePage({ params }: any) {
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

  const { slug } = await params;

  // --- Load course ---
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return <div className="p-10 text-red-400">Kurs nicht gefunden.</div>;

  // Load modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("position");

  // Load user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let lessonProgress: any[] = [];

  if (user) {
    const { data } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id);

    lessonProgress = data ?? [];
  }


  // total lessons
  let allLessons: any[] = [];
  for (const mod of modules ?? []) {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", mod.id)
      .order("position");

    allLessons.push(...(data ?? []));
  }

  const totalLessons = allLessons.length;

  // Find first lesson for "Kurs starten"
  const firstLesson = allLessons[0];

  // progress calc
  let continueLessonHref = null;
let courseProgress = 0;

if (user) {
  const completedLessonIds = lessonProgress
    .filter((p) => p.completed)
    .map((p) => p.lesson_id);

  const completedCount = completedLessonIds.length;

  courseProgress = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  // nächste Lesson finden
  const nextLesson = allLessons.find(
    (l) => !completedLessonIds.includes(l.id)
  );

  if (nextLesson) {
    continueLessonHref = `/academy/lesson/${nextLesson.id}`;
  } else {
    // alles fertig
    continueLessonHref = null;
  }
}


  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-10">

      {/* HEADER */}
      <header className="space-y-2">
        <p className="text-xs text-[#d8a5d0] uppercase tracking-[0.25em]">
          Kurs
        </p>

        <h1 className="text-3xl font-bold tracking-wide">{course.title}</h1>
        <p className="text-gray-300">{course.description}</p>

        {/* BADGE */}
        {courseProgress === 100 ? (
          <div className="inline-block px-3 py-1 mt-3 rounded-full bg-[#a75692]/20 border border-[#a75692] text-[#d8a5d0] text-xs">
            🏅 Zertifikat abgeschlossen
          </div>
        ) : (
          <div className="inline-block px-3 py-1 mt-3 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">
            🔒 Zertifikat nach Abschluss verfügbar
          </div>
        )}
      </header>

      {/* PROGRESS */}
      {user && (
      <div className="space-y-2">
        <ProgressBar progress={Math.round(courseProgress)} />
        <p className="text-xs text-gray-400">
          {Math.round(courseProgress)}% abgeschlossen
        </p>
      </div>
    )}


      {/* ACTION BUTTON */}
      {/* ACTION BUTTON */}
      {/* Kurs starten → nur zeigen, wenn CourseProgress == 0 UND der User NICHT eingeloggt oder NICHTS begonnen hat */}
      {continueLessonHref === null && courseProgress === 0 && (
        <StartCourseButton
          courseId={course.id}
          firstLessonId={firstLesson.id}
          redirectHref={`/academy/lesson/${firstLesson.id}`}
        />
      )}

      {/* Weiter lernen → User hat begonnen, aber nicht fertig */}
      {continueLessonHref !== null && courseProgress < 100 && (
        <Link
          href={continueLessonHref}
          className="
            inline-block px-4 py-2 rounded-xl 
            bg-[#a75692]/30 border border-[#d8a5d0]/50 
            text-[#d8a5d0] text-sm font-medium
            hover:bg-[#a75692]/50 transition
          "
        >
          Weiter lernen →
        </Link>
      )}



      {/* MODULE LIST */}
      <section className="space-y-6">
        {modules?.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4"
          >
            <h2 className="text-xl font-semibold">{mod.title}</h2>
            <p className="text-gray-400">{mod.description}</p>

            <ModuleLessons moduleId={mod.id} />
          </div>
        ))}
      </section>
    </div>
  );
}

/* -------- Load lessons per module ---------- */
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
