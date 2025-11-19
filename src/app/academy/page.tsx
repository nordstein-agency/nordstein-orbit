const highlightCards = [
  {
    title: "Entry",
    subtitle: "Dein Start bei Nordstein",
    text: "Lerne die Customer Journey, Leitfäden, Marketing Basics und alle Grundlagen, um im Daily Business sicher zu agieren.",
    href: "/academy/category/entry",
    badge: "Level 1",
  },
  {
    title: "Growth",
    subtitle: "Vom Starter zum High Performer",
    text: "Vertiefe deine Skills in Content Creation, Funnel, Verkaufspsychologie und Recruiting-Prozessen.",
    href: "/academy/category/growth",
    badge: "Level 2",
  },
  {
    title: "Leader",
    subtitle: "Leadership & Skalierung",
    text: "Führung, KPIs, Rhetorik, Aktivitätenplanung und High Ticket Closing – alles für deinen Weg zur Top-Führungskraft.",
    href: "/academy/category/leader",
    badge: "Level 3",
  },
];

export default function AcademyPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pt-12">
      {/* Header */}
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-2">
          Orbit Academy
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          Lernen. Wachsen. Führen.
        </h1>
        <p className="text-gray-300 mt-3 max-w-2xl text-sm md:text-base">
          Die Nordstein Academy bündelt alle Trainings – von den ersten Steps im Recruiting 
          bis zur Führung einer eigenen Struktur. Starte dort, wo du gerade stehst.
        </p>
      </header>

      {/* Highlight Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlightCards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="
              group relative rounded-2xl border border-white/10 bg-gradient-to-br 
              from-[#1a0f17] via-black to-[#120912]
              p-5 flex flex-col justify-between
              hover:border-[#d8a5d0]/60 hover:shadow-[0_0_35px_#a7569277]
              hover:-translate-y-1 transition-all duration-200
            "
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {card.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {card.subtitle}
                </p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-gray-200">
                {card.badge}
              </span>
            </div>

            <p className="text-sm text-gray-300 flex-1">
              {card.text}
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-[#d8a5d0]">
              <span>Alle Inhalte ansehen</span>
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>

            {/* Hintergrund-Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,_#a7569244,_transparent_60%)]" />
            </div>
          </a>
        ))}
      </section>

      {/* Placeholder */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <h3 className="text-sm font-semibold mb-2 text-white">
          Demnächst:
        </h3>
        <p className="text-sm text-gray-300">
          Hier werden später deine zuletzt geöffneten Kurse, dein Fortschritt 
          und persönliche Empfehlungen angezeigt.
        </p>
      </section>
    </div>
  );
}
