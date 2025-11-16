import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";

export default async function AcademyAdminPage() {
  // Supabase Server Client
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

  // Kurse aus DB laden
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
          Admin • Orbit Academy
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Academy – Kursverwaltung
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl">
          Hier verwaltest du alle Kurse der Nordstein Academy.
        </p>
      </header>

      {/* Button */}
      <section className="flex justify-end">
        <OrbitButtonLink href="/admin/academy/new" variant="primary">
             Neuen Kurs anlegen
        </OrbitButtonLink>
      </section>

      {/* Kursliste */}
      <section className="space-y-3">

        <h2 className="text-sm font-semibold text-white">
          Alle Kurse
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-300 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Titel</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-left px-4 py-3">Dauer</th>
                <th className="text-left px-4 py-3">Aktionen</th>
              </tr>
            </thead>

            <tbody>
              {courses?.map((course) => (
                <tr key={course.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white">
                    {course.title}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {course.level_required}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {course.est_duration ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/academy/course/${course.slug}`}
                      className="text-[#d8a5d0] hover:underline"
                    >
                      Bearbeiten →
                    </a>
                  </td>
                </tr>
              ))}

              {!courses?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Noch keine Kurse vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>
    </div>
  );
}
