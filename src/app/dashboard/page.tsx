import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {
  // NEXT.JS 16: cookies() ist async
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="pt-16 px-6 pb-20 min-h-screen text-white">

      {/* --- Begrüßung --- */}
      <section className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-wide">
          Willkommen zurück,{" "}
          <span className="text-[#d8a5d0]">{user.email}</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Dein persönliches Orbit Cockpit.
        </p>
      </section>

      {/* --- Grid mit Orbit Cards --- */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {[
          {
            title: "Mitarbeiter",
            text: "Übersicht über Team, Bewerber & Performance.",
            color: "bg-[#d8a5d0]",
            note: "Kommt bald – Mitarbeiterführung & Growth.",
          },
          {
            title: "Leads",
            text: "Lead Management & persönliche Rekrutierung.",
            color: "bg-green-400",
            note: "Live Tracking geplant.",
          },
          {
            title: "Vertrieb & EH",
            text: "Monatliche Einheiten, Analyse, Reportings.",
            color: "bg-yellow-300",
            note: "EH-Sync + Charts + Insights.",
          },
          {
            title: "Kalender",
            text: "Analysen, Beratungen, Recruiting-Termine.",
            color: "bg-blue-400",
            note: "TimeTree Sync geplant.",
          },
          {
            title: "Bewerber Funnel",
            text: "Vom Lead → Info → Gespräch → Onboarding.",
            color: "bg-purple-300",
            note: "Automatische Funnel-Analyse.",
          },
          {
            title: "Einstellungen",
            text: "Profil, Rechte, Benachrichtigungen.",
            color: "bg-orange-300",
            note: "Benutzerrollen folgen bald.",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="group p-6 rounded-2xl 
              bg-white/5 border border-white/10 backdrop-blur-xl 
              transition-all duration-300
              hover:scale-[1.02] hover:border-[#d8a5d0]/40 
              hover:shadow-[0_0_25px_#d8a5d055]
              cursor-pointer animate-fade-in"
          >
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-sm text-gray-300 mb-4">{card.text}</p>

            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${card.color} animate-pulse`} />
              <span className="text-xs text-gray-300">{card.note}</span>
            </div>
          </div>
        ))}

      </section>
    </main>
  );
}
