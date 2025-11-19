import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    }
  );

  /* --- User abrufen --- */
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

  /* --- Zertifikate abrufen --- */
  const { data: certs } = await supabase
    .from("user_certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  if (!certs || certs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-10 space-y-6">
        <h1 className="text-3xl font-bold">Zertifikate</h1>
        <p className="text-gray-300">
          Du hast noch keine Zertifikate erhalten.
        </p>
      </div>
    );
  }

  /* --- zugehörige Kurse laden --- */
  const courseIds = certs.map((c) => c.course_id);

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds);

  const courseMap = new Map();
  courses?.forEach((c) => courseMap.set(c.id, c));

  /* -------------------------------------------------------- */

  return (
    <div className="max-w-5xl mx-auto pt-10 space-y-10">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-wide">Zertifikate</h1>
        <p className="text-gray-300 mt-2">
          Hier findest du alle Zertifikate, die du im Rahmen der Orbit Academy abgeschlossen hast.
        </p>
      </header>

      {/* Zertifikate Liste */}
      <div className="space-y-6">
        {certs.map((cert) => {
          const course = courseMap.get(cert.course_id);

          return (
            <div
              key={cert.id}
              className="
                p-6 rounded-2xl border border-white/10 bg-black/40
                hover:border-[#d8a5d0] transition
                space-y-4
              "
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {course?.title ?? "Unbekannter Kurs"}
                </h2>

                <span className="px-3 py-1 text-xs rounded-full bg-green-600/20 text-green-400">
                  Ausgestellt
                </span>
              </div>

              <p className="text-gray-400">
                Ausgestellt am:{" "}
                <span className="text-gray-200">
                  {new Date(cert.issued_at).toLocaleDateString("de-DE")}
                </span>
              </p>

              {/* Download Button */}
              <div className="flex justify-end">
                <a
                  href={cert.pdf_url}
                  target="_blank"
                  className="
                    px-4 py-2 rounded-xl bg-[#a7569222] border border-[#a75692]
                    hover:bg-[#a7569244] transition text-[#d8a5d0]
                  "
                >
                  PDF herunterladen
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
