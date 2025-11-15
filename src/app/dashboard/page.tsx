// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">
            Nordstein Orbit – Dashboard
          </h1>
          <p className="text-xs text-gray-400">
            Willkommen im internen Nordstein One Portal.
          </p>
        </div>

        <div className="text-xs text-gray-300">
          {/* Platzhalter – später: Nutzername, Rolle, Logout */}
          <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10">
            Demo User
          </span>
        </div>
      </header>

      <section className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <h2 className="text-sm font-medium mb-1">Übersicht</h2>
            <p className="text-xs text-gray-400">
              Hier kommen später deine Kennzahlen, Mitarbeiter & Analysen rein.
            </p>
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <h2 className="text-sm font-medium mb-1">Mitarbeiter</h2>
            <p className="text-xs text-gray-400">
              Später: Übersicht über dein Team, Status und Performance.
            </p>
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <h2 className="text-sm font-medium mb-1">Termine & Analysen</h2>
            <p className="text-xs text-gray-400">
              Später: Kalender, Analysen, Beratungen & Bewerbungsgespräche.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
