import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import OrbitButton from "@/components/orbit/OrbitButton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseEditPage({ params }: PageProps) {
  // ⬇️ params-Promise einmal auflösen
  const { slug } = await params;

  // cookies() ist synchron, du brauchst hier kein await
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
      },
    }
  );

  // Kurs laden
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)   // ⬅️ hier slug verwenden
    .single();

  if (courseError || !course) {
    return (
      <div className="pt-24 max-w-3xl mx-auto text-sm text-gray-300">
        <h1 className="text-2xl font-bold mb-2">Kurs nicht gefunden</h1>
        <p className="mb-4">
          Der angeforderte Kurs existiert nicht oder du hast keine Berechtigung.
        </p>
        <a
          href="/admin/academy"
          className="text-[#d8a5d0] hover:underline"
        >
          ← Zurück zur Kursübersicht
        </a>
      </div>
    );
  }

  // Module + zugehörige Lessons laden
  const { data: modules } = await supabase
    .from("modules")
    .select(
      `
      id,
      title,
      description,
      position,
      lessons:lessons (
        id,
        title,
        position
      )
    `
    )
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const sortedModules =
    modules?.map((m) => ({
      ...m,
      lessons: (m.lessons || []).sort(
        (a: any, b: any) => a.position - b.position
      ),
    })) ?? [];

  const levelLabel =
    course.level_required === "entry"
      ? "Entry (für alle)"
      : course.level_required === "growth"
      ? "Growth (ab Trainee II)"
      : "Leader (ab Consultant)";

  return (
    <div className="pt-24 pb-12 max-w-6xl mx-auto flex gap-8">
      {/* STICKY ORBIT SIDEBAR */}
      <aside
        className="
          w-72 flex-shrink-0
          sticky top-24 self-start
          rounded-2xl border border-white/10
          bg-black/40 backdrop-blur-xl
          shadow-[0_0_30px_rgba(150,80,140,0.25)]
          p-5 space-y-4
        "
      >
        <a
          href="/admin/academy"
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Zurück zur Übersicht
        </a>

        {/* Orbit Course Header */}
        <div className="space-y-1">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#d8a5d0]">
            Orbit Kurs
          </p>
          <h2 className="text-lg font-semibold leading-snug">
            {course.title}
          </h2>
          <p className="text-xs text-gray-400">
            {course.description || "Noch keine Beschreibung hinterlegt."}
          </p>
        </div>

        {/* Level Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d8a5d0] animate-pulse" />
          <span className="uppercase tracking-wide">
            {levelLabel}
          </span>
        </div>

        {/* Orbit Module Overview */}
        <div className="pt-2 border-t border-white/10 mt-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2">
            Orbit Module
          </p>

          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {sortedModules.length === 0 && (
              <p className="text-xs text-gray-500">
                Noch keine Orbit Module angelegt.
              </p>
            )}

            {sortedModules.map((mod: any) => (
              <div key={mod.id} className="space-y-1">
                <a
                  href={`/admin/academy/course/${course.slug}/module/${mod.id}`}
                  className="
                    text-sm text-white font-medium
                    hover:text-[#d8a5d0] transition-colors
                  "
                >
                  {mod.position}. {mod.title}
                </a>

                {/* Orbit Lessons */}
                {mod.lessons && mod.lessons.length > 0 && (
                  <div className="pl-3 border-l border-white/10 space-y-0.5">
                    {mod.lessons.map((lesson: any) => (
                      <a
                        key={lesson.id}
                        href={`/admin/academy/lesson/${lesson.id}`}
                        className="
                          block text-[11px] text-gray-400 
                          hover:text-gray-100 transition-colors
                        "
                      >
                        {mod.position}.{lesson.position} {lesson.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 space-y-8">
        {/* Title Row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase mb-1">
              Admin • Orbit Academy
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
              {course.title}
            </h1>
            <p className="text-sm text-gray-300">
              Bearbeite hier alle Orbit Module, Lektionen und Einstellungen dieses Kurses.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <OrbitButton
              variant="secondary"
              className="px-4 py-2 text-xs"
            >
              Kurs-Einstellungen (kommt noch)
            </OrbitButton>
            <span className="text-[11px] text-gray-500">
              Slug: <code className="text-gray-300">{course.slug}</code>
            </span>
          </div>
        </div>

        {/* Kursdetails */}
        <section
          className="
            rounded-2xl border border-white/10 
            bg-black/40 p-5 space-y-3
          "
        >
          <h2 className="text-sm font-semibold text-white">
            Orbit Kursdetails
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="text-xs text-gray-400 mb-1">Titel</p>
              <p>{course.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Level</p>
              <p>{levelLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Dauer</p>
              <p>{course.est_duration ? `${course.est_duration} Minuten` : "nicht gesetzt"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Erstellt am</p>
              <p>
                {course.created_at
                  ? new Date(course.created_at).toLocaleString("de-AT")
                  : "–"}
              </p>
            </div>
          </div>
        </section>

        {/* Module Übersicht */}
        <section
          className="
            rounded-2xl border border-white/10 
            bg-black/40 p-5 space-y-4
          "
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Orbit Module in diesem Kurs
            </h2>
            <a href={`/admin/academy/course/${course.slug}/new-module`}>
              <OrbitButton variant="primary" className="text-xs px-3 py-2">
                Neues Orbit Modul anlegen
              </OrbitButton>
            </a>
          </div>

          {sortedModules.length === 0 ? (
            <p className="text-sm text-gray-400">
              Noch keine Orbit Module angelegt. Erstelle jetzt das erste Modul.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedModules.map((mod: any) => (
                <div
                  key={mod.id}
                  className="
                    rounded-xl border border-white/10 
                    bg-gradient-to-br from-[#1a0f17] via-black to-[#120912]
                    p-4 flex flex-col gap-2
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        Orbit Modul {mod.position}
                      </p>
                      <h3 className="text-sm font-semibold text:white">
                        {mod.title}
                      </h3>
                    </div>
                    <a href={`/admin/academy/course/${course.slug}/module/${mod.id}`}>
                      <OrbitButton
                        variant="secondary"
                        className="text-[11px] px-3 py-1.5"
                      >
                        Modul bearbeiten
                      </OrbitButton>
                    </a>
                  </div>

                  {mod.description && (
                    <p className="text-xs text-gray-400">
                      {mod.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>
                      {mod.lessons?.length
                        ? `${mod.lessons.length} Orbit Lessons`
                        : "Noch keine Orbit Lessons hinterlegt"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
