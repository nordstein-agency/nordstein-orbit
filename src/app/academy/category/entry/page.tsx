import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function EntryCategoryPage() {
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

  // Alle ENTRY-Kurse laden
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("category", "entry")
    .order("position", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pt-6">
      {/* Header */}
      <header>
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase mb-2">
          Entry Level
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Entry – Grundlagen bei Nordstein
        </h1>
        <p className="text-gray-300 mt-3 max-w-2xl text-sm md:text-base">
          Wähle einen Kurs, um die Inhalte zu starten.
        </p>
      </header>

      {/* Kursliste */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses?.map((course) => (
          <Link
            key={course.id}
            href={`/academy/course/${course.slug}`}
            className="
              group relative rounded-2xl border border-white/10
              bg-gradient-to-br from-[#1a0f17] via-black to-[#120912]
              p-5 flex flex-col justify-between
              transition-transform duration-150
              hover:-translate-y-[2px]
            "
          >
            {/* sanfter Glow */}
            <div
              className="
                pointer-events-none absolute inset-0 rounded-2xl
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
                bg-[radial-gradient(circle_at_center,_#a7569244,_transparent_70%)]
              "
            ></div>

            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-white mb-1">
                {course.title}
              </h2>
              <p className="text-sm text-gray-300">{course.description}</p>
            </div>

            <div className="mt-4 text-xs text-[#d8a5d0] relative z-10 flex items-center justify-between">
              <span>Kurs öffnen</span>
              <span className="transition-transform duration-150 group-hover:translate-x-[2px]">
                →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
