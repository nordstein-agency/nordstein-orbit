import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function DashboardPage() {
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
    <main className="pt-24 min-h-screen px-6 pb-20 text-white relative">

      {/* Hintergrund-Noise + Glow */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#451a3d]/40 blur-[160px] rounded-full" />

      {/* Begrüßung */}
      <section className="relative z-10 mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-wide">
          Willkommen zurück, <span className="text-[#d8a5d0]">{user.email}</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Dein persönliches Orbit Cockpit.
        </p>
      </section>

      {/* Grid mit Features / Modulen */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 relative z-10">

        {/* Card 1 – Mitarbeiter */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer
          animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Mitarbeiter</h2>
          <p className="text-sm text-gray-400 mb-4">
            Übersicht über Team, Bewerber & Performance.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#d8a5d0] animate-pulse" />
            <span className="text-xs text-gray-300">
              Kommt bald – Mitarbeiterführung, Growth & Pipeline.
            </span>
          </div>
        </div>

        {/* Card 2 – Leads */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Leads</h2>
          <p className="text-sm text-gray-400 mb-4">
            Lead Management & persönliche Rekrutierung.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-300">Live Tracking geplant.</span>
          </div>
        </div>

        {/* Card 3 – Vertrieb */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Vertrieb & EH</h2>
          <p className="text-sm text-gray-400 mb-4">
            Monatliche Einheiten, Analyse, Reportings.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            <span className="text-xs text-gray-300">
              Demnächst EH-Sync + Charts + Insights.
            </span>
          </div>
        </div>

        {/* Card 4 – Kalender */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Kalender</h2>
          <p className="text-sm text-gray-400 mb-4">
            Analysen, Beratungen, Recruiting-Termine.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-gray-300">
              TimeTree Sync geplant.
            </span>
          </div>
        </div>

        {/* Card 5 – Bewerber */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Bewerber Funnel</h2>
          <p className="text-sm text-gray-400 mb-4">
            Vom Lead → Info → Gespräch → Onboarding.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
            <span className="text-xs text-gray-300">
              Kommt mit automatischer Funnel-Analyse.
            </span>
          </div>
        </div>

        {/* Card 6 – Einstellungen */}
        <div className="group p-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl 
          hover:border-[#d8a5d0]/40 hover:shadow-[0_0_25px_#d8a5d055]
          transition-all hover:scale-[1.02] cursor-pointer animate-fade-in"
        >
          <h2 className="text-lg font-semibold mb-2">Einstellungen</h2>
          <p className="text-sm text-gray-400 mb-4">
            Profil, Rechte, Benachrichtigungen.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
            <span className="text-xs text-gray-300">
              Benutzerrollen folgen bald.
            </span>
          </div>
        </div>

      </section>
    </main>
  );
}
