import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import ProgressBar from "@/components/academy/lesson/ProgressBar";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    }
  );

  /* --- Get current user --- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-10 text-red-400">
        Du musst eingeloggt sein.
      </div>
    );
  }

  /* --- Load progress entries for this user --- */
  const { data: progressEntries } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", user.id);

  if (!progressEntries || progressEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-10 space-y-6">
        <h1 className="text-3xl font-bold">Meine Kurse</h1>
        <p className="text-gray-300">Du hast noch keine Kurse gestartet.</p>
      </div>
    );
  }

  /* --- Load all related courses --- */
  const courseIds = progressEntries.map((p) => p.course_id);

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds);

  /* --- Load lessons for all courses (to compute progress) --- */
  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id");

  const moduleIds = modules?.map((m) => m.id) ?? [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds);

  /* ----------------------------------------------------------- */
  /* --- Build Course Progress List ---------------------------- */
  /* ----------------------------------------------------------- */

  const list = courses!.map((course) => {
    const prog = progressEntries.find((p) => p.course_id === course.id);

    // alle Lessons dieses Kurses
    const courseModules = modules?.filter((m) => m.course_id === course.id);
    const lessonsOfCourse = lessons?.filter((l) =>
      courseModules?.some((m) => m.id === l.module_id)
    ) ?? [];

    // aktuelle Lesson
    const currentLesson = lessonsOfCourse.find((l) => l.id === prog?.lesson_id);

    // Position der aktuellen Lesson
    const sortedLessons = [...lessonsOfCourse].sort((a, b) => a.position - b.position);
    const currentIndex = sortedLessons.findIndex((l) => l.id === currentLesson?.id);

    // Fortschritt
    const percent =
      sortedLessons.length > 0
        ? Math.round(((currentIndex + 1) / sortedLessons.length) * 100)
        : 0;

    const isCompleted =
      prog?.completet === true || percent >= 100;

    return {
      course,
      progress: percent,
      status: isCompleted ? "Abgeschlossen" : "Gestartet",
    };
  });

  /* ----------------------------------------------------------- */

  return (
    <div className="max-w-5xl mx-auto pt-10 space-y-10">

      <header>
        <h1 className="text-3xl font-bold tracking-wide">Meine Kurse</h1>
        <p className="text-gray-300 mt-2">
          Hier findest du alle Kurse, die du bereits begonnen oder abgeschlossen hast.
        </p>
      </header>

      <div className="space-y-6">
        {list.map(({ course, progress, status }) => (
          <div
            key={course.id}
            className="
              p-6 rounded-2xl border border-white/10 bg-black/40
              hover:border-[#d8a5d0] transition
              space-y-4
            "
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{course.title}</h2>

              <span
                className={`
                  px-3 py-1 text-xs rounded-full
                  ${status === "Abgeschlossen"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-purple-600/20 text-purple-300"
                  }
                `}
              >
                {status}
              </span>
            </div>

            <p className="text-gray-400">{course.description}</p>

            {/* Progress Bar */}
            <ProgressBar progress={progress} height="h-2" />

            {/* Action */}
            <div className="flex justify-end">
              <Link
                href={`/academy/course/${course.slug}`}
                className="px-4 py-2 rounded-xl bg-[#a7569222] border border-[#a75692] hover:bg-[#a7569244] transition text-[#d8a5d0]"
              >
                Weiter
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
