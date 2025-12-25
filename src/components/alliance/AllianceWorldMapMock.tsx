"use client";

const MOCK_COUNTRIES = [
  { id: "DE", x: "52%", y: "32%", label: "Germany" },
  { id: "AT", x: "54%", y: "34%", label: "Austria" },
  { id: "CH", x: "53%", y: "35%", label: "Switzerland" },
  { id: "US", x: "28%", y: "38%", label: "USA" },
  { id: "AE", x: "62%", y: "45%", label: "UAE" },
];

export default function AllianceWorldMapMock() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">

      {/* Headline Stats */}
      <div className="mb-6 flex flex-wrap gap-6">
        <Stat label="Aktive Länder" value="5+" />
        <Stat label="Alliance Partner" value="—" />
        <Stat label="Globale Projekte" value="—" />
      </div>

      {/* Map Container */}
      <div
        className="
          relative w-full aspect-[2/1] rounded-2xl
          border border-white/5 overflow-hidden
          bg-[#0a0a0a]
          bg-no-repeat bg-center bg-contain
        "
        style={{
          backgroundImage: "url('/maps/world.svg')",
        }}
      >
        {/* Subtle Alliance Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,130,0.08),transparent_65%)]" />

        {/* Country Markers */}
        {MOCK_COUNTRIES.map((c) => (
          <div
            key={c.id}
            className="absolute group"
            style={{ left: c.x, top: c.y }}
          >
            {/* Glow */}
            <div className="absolute -inset-3 rounded-full bg-[#f5d27a] opacity-20 blur-xl animate-pulse" />

            {/* Dot */}
            <div className="relative h-3 w-3 rounded-full bg-gradient-to-br from-[#fff3c4] via-[#e4c46d] to-[#b88a2a] shadow-[0_0_12px_rgba(255,215,130,0.8)]" />

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 border border-white/10 px-3 py-1 text-[11px] text-[#e4c46d] opacity-0 group-hover:opacity-100 transition">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-[#d8a5d0]">
        {label}
      </p>
      <p className="text-xl font-bold text-[#f5d27a]">{value}</p>
    </div>
  );
}
