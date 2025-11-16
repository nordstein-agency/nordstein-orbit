const entryCourses = [
  {
    title: "Customer Journey",
    description:
      "Verstehe den kompletten Weg vom ersten Kontakt bis zum zufriedenen Nordstein-Kunden.",
  },
  {
    title: "Leitfäden & Pitch",
    description:
      "Grundlagen der Nordstein-Gesprächsführung – wie du sicher und klar auftrittst.",
  },
  {
    title: "Marketing Basics",
    description:
      "Was ist gutes Marketing? Grundlagen für Social Media, Content und Werbesprache.",
  },
  {
    title: "Performance Marketing Basics",
    description:
      "Einführung in bezahlte Werbung und die wichtigsten Kennzahlen.",
  },
  {
    title: "Produkte Nordstein",
    description:
      "Überblick über die wichtigsten Nordstein-Leistungen und Angebote.",
  },
  {
    title: "Sales Calls Basics",
    description:
      "Wie du Telefonate und Voice-Nachrichten professionell und klar führst.",
  },
  {
    title: "Die vier Menschentypen",
    description:
      "Grundlagen der Persönlichkeitstypen für bessere Kommunikation im Alltag.",
  },
  {
    title: "Lead Management (Workshop)",
    description:
      "Wie du Leads strukturierst, priorisierst und sauber dokumentierst.",
  },
];

export default function EntryCategoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <header>
        <p className="text-xs font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase mb-2">
          Entry Level
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
          Entry – Grundlagen bei Nordstein
        </h1>
        <p className="text-gray-300 mt-3 max-w-2xl text-sm md:text-base">
          In diesen Modulen lernst du die Basis für deine Arbeit bei Nordstein:
          Customer Journey, Leitfäden, Marketing und erste Sales-Skills.
        </p>
      </header>

      {/* Kursliste */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {entryCourses.map((course) => (
          <div
            key={course.title}
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
              <p className="text-sm text-gray-300">
                {course.description}
              </p>
            </div>

            <div className="mt-4 text-xs text-[#d8a5d0] relative z-10 flex items-center justify-between">
              <span>Kurs öffnen (kommt noch)</span>
              <span className="transition-transform duration-150 group-hover:translate-x-[2px]">
                →
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
