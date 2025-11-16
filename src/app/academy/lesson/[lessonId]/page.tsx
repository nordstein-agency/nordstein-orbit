import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function youtubeToEmbed(url: string) {
  if (!url) return "";

  // youtu.be links
  if (url.includes("youtu.be")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  // watch?v=
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  // sonst zurück
  return url;
}


export default async function LessonPage({ params }: any) {
  // Next.js 16: params ist ein Promise
  const { lessonId } = await params;

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

  // 1. Lesson laden
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  // 2. Blocks laden
  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position");

    

  if (!lesson) {
    return (
      <div className="p-10 text-red-400">
        Lesson nicht gefunden.
      </div>
    );
  }

    // Modul laden
  const { data: moduleData } = await supabase
    .from("modules")
    .select("*")
    .eq("id", lesson.module_id)
    .single();

  // Kurs laden
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", moduleData.course_id)
    .single();


      // Alle Lessons des Moduls laden (für Navigation)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleData.id)
    .order("position");

  // 6. Navigation berechnen (null-safe)
const safeLessons = allLessons ?? [];
const index = safeLessons.findIndex((l) => l.id === lesson.id);

const prevLesson = index > 0 ? safeLessons[index - 1] : null;
const nextLesson =
  index < safeLessons.length - 1 ? safeLessons[index + 1] : null;




  return (
    <div className="max-w-3xl mx-auto pt-24 pb-20 space-y-10">
      {/* Header */}
      <header className="space-y-3">
        {/* BACK BUTTON */}
        <a
            href={`/academy/course/${courseData.slug}`}
            className="text-xs text-[#d8a5d0] hover:underline"
        >
            ← Zurück zum Kurs
        </a>

        <p className="text-xs text-[#d8a5d0] uppercase tracking-[0.25em]">
            Lesson
        </p>

        <h1 className="text-3xl font-bold tracking-wide">{lesson.title}</h1>

        {lesson.description && (
            <p className="text-gray-300 mt-2">{lesson.description}</p>
        )}
        </header>


      {/* CONTENT BLÖCKE */}
      <section className="space-y-8">
        {blocks?.map((block) => (
          <div key={block.id} className="space-y-3">
            {/* TEXTBLOCK */}
            {block.block_type === "text" && (
              <div
                className="
                  p-5 rounded-xl 
                  bg-gradient-to-br from-[#1a0f17] via-black to-[#110811]
                  border border-white/10 
                  text-gray-200
                "
              >
                {block.content}
              </div>
            )}

            {/* VIDEOBLOCK */}
            {block.block_type === "video" && (
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black">

                {/* Glow Effekt */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d8a5d022] to-transparent pointer-events-none" />

                {/* YouTube Player */}
                <iframe
                className="w-full aspect-video rounded-2xl"
                src={youtubeToEmbed(block.data?.youtube_url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                />
            </div>
            )}

          </div>
        ))}
      </section>


              {/* NAVIGATION */}
      <div className="flex justify-between pt-10">
        {prevLesson ? (
          <a
            href={`/academy/lesson/${prevLesson.id}`}
            className="text-[#d8a5d0] hover:underline"
          >
            ← {prevLesson.title}
          </a>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <a
            href={`/academy/lesson/${nextLesson.id}`}
            className="text-[#d8a5d0] hover:underline"
          >
            {nextLesson.title} →
          </a>
        ) : (
          <div />
        )}
      </div>



    </div>
  );
}
