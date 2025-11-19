import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import LessonTopbar from "@/components/academy/lesson/LessonTopbar";
import LessonSidebar from "@/components/academy/lesson/LessonSidebar";
import LessonBlock from "@/components/academy/lesson/LessonBlock";
import LessonProgressSync from "@/components/academy/lesson/LessonProgressSync";
import OrbitQuizPlayer from "@/components/academy/OrbitQuizPlayer";

export default async function LessonPage({ params }: any) {
  const { lessonId } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name: string) => cookieStore.get(name)?.value },
    }
  );

  /* --- Lesson laden --- */
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return <div className="p-10 text-red-400">Lesson nicht gefunden.</div>;
  }

  /* --- Modul laden --- */
  const { data: moduleData } = await supabase
    .from("modules")
    .select("*")
    .eq("id", lesson.module_id)
    .single();

  /* --- Kurs laden --- */
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", moduleData.course_id)
    .single();

  /* --- Blocks laden --- */
  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position");

  /* --- Alle Lessons im Modul laden --- */
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleData.id)
    .order("position");

  const safeLessons = allLessons ?? [];

  const currentIndex = safeLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? safeLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < safeLessons.length - 1
      ? safeLessons[currentIndex + 1]
      : null;

  /* --- User Progress laden --- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProgress = null;

  if (user) {
    const { data: foundProgress } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseData.id)
      .single();

    userProgress = foundProgress;
  }

  /* --- Progress berechnen --- */
  const progressPercent =
    safeLessons.length > 0
      ? ((currentIndex + 1) / safeLessons.length) * 100
      : 0;

  /* ---------------- E-Learning UI ---------------- */
  return (
    <div className="flex w-full min-h-screen">

      {/* SIDEBAR */}
      <LessonSidebar
        moduleTitle={moduleData.title}
        lessons={safeLessons}
        currentLessonId={lesson.id}
      />

      {/* MAIN CONTENT / PLAYER */}
      <main className="flex-1 px-4 md:px-10 py-6 md:py-10 space-y-8">

        {/* Fortschritt in DB aktualisieren */}
        <LessonProgressSync
          courseId={courseData.id}
          lessonId={lesson.id}
        />

        {/* Topbar */}
        <LessonTopbar
          courseTitle={courseData.title}
          moduleTitle={moduleData.title}
          lessonTitle={lesson.title}
          backHref={`/academy/course/${courseData.slug}`}
          progressPercent={progressPercent}
        />

        {/* Lesson Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-[#d8a5d0]">
            Lesson
          </p>
          <h1 className="text-3xl font-bold mt-1">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-300 mt-2">{lesson.description}</p>
          )}
        </header>

        {/* BLOCKS */}
        <section className="space-y-8">
          {blocks?.map((block) => (
            <LessonBlock key={block.id} block={block} />
          ))}
        </section>

        {Array.isArray(blocks) && blocks.some(b => b.block_type === "quiz") && (
          <OrbitQuizPlayer lessonId={lessonId} />
        )}


        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-white/10">
          {prevLesson ? (
            <OrbitButtonLink
              href={`/academy/lesson/${prevLesson.id}`}
              variant="secondary"
            >
              ← {prevLesson.title}
            </OrbitButtonLink>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <OrbitButtonLink
              href={`/academy/lesson/${nextLesson.id}`}
              variant="primary"
            >
              {nextLesson.title} →
            </OrbitButtonLink>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}
