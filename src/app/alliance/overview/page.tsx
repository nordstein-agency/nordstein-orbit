// src/app/alliance/overview/page.tsx

import { AllianceButtonLink } from "@/components/alliance/AllianceButton";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import Link from "next/link";

/* PAGE */
export default function AllianceOverviewPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#120b10] to-[#0a0709] px-8 py-16 text-white">

      {/* BACKGROUND LIGHT BLOBS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
      </div>

      {/* HEADER */}
      <div className="relative z-10 max-w-6xl mx-auto mb-14 flex items-center justify-between">

        {/* GOLD HEADLINE */}
        <h1
          className="
            text-5xl font-extrabold tracking-tight relative
            bg-gradient-to-br from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
            bg-clip-text text-transparent
            drop-shadow-[0_0_18px_rgba(255,215,130,0.55)]
            [text-shadow:0_0_10px_rgba(255,235,180,0.55)]
          "
        >
          Alliance Dashboard
          <span className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent blur-[18px] opacity-30" />
        </h1>

        <AllianceButtonLink href="/alliance" className="w-48">
          Zur Alliance
        </AllianceButtonLink>
      </div>

      {/* DASHBOARD FLOW LAYOUT */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">

        {/* ROW 1 — Groß + Klein */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedAllianceCard
            title="Partner Directory"
            desc="Alle Partner"
            href="/alliance/partners"
            className="md:col-span-2 h-[220px]"
          />
          <AnimatedAllianceCard
            title="Matching Engine"
            desc="KI-gestützte Vorschläge für ideale Projekt-Partner."
            href="/alliance/matching"
            className="h-[220px]"
          />
        </div>

        {/* ROW 2 — Drei mittlere Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedAllianceCard
            title="Alliance Projects"
            desc="Projektstatus, Verantwortlichkeiten & Fulfillment."
            href="/alliance/projects"
          />
          <AnimatedAllianceCard
            title="Upsell Radar"
            desc="KI-basierte Cross-Sell & Upsell Empfehlungen."
            href="/alliance/upsell"
          />
          <AnimatedAllianceCard
            title="Analytics"
            desc="Performance, Qualitätsscore, Auslastung & Wachstum."
            href="/alliance/analytics"
          />
        </div>

        

      </div>
    </div>
  );
}

/* -------------------------------- */
/*  ANIMATED PREMIUM ALLIANCE CARD  */
/* -------------------------------- */

function AnimatedAllianceCard({
  title,
  desc,
  href,
  className = "",
}: {
  title: string;
  desc: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden rounded-2xl p-8
        bg-[#1f1620]/60 border border-[#3a2238] backdrop-blur-xl
        shadow-xl transition-all duration-300
        hover:scale-[1.03] hover:-translate-y-1 
        hover:shadow-[0_0_40px_rgba(255,230,180,0.15)]
        hover:border-[#b88a2a]/40
        ${className}
      `}
    >

      {/* Animated Shine Layer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-shine" />
      </div>

      {/* Title */}
      <h3
        className="
          text-xl font-bold mb-2
          bg-gradient-to-br from-[#fff3c4] via-[#d4a843] to-[#b88a2a]
          bg-clip-text text-transparent
          drop-shadow-[0_0_8px_rgba(255,220,160,0.45)]
        "
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#c9b5c7] text-sm leading-relaxed mb-6">
        {desc}
      </p>

      {/* Arrow */}
      <div className="text-right">
        <span
          className="
            text-sm font-medium text-[#e6c476]
            group-hover:text-[#f7e7a3] transition
          "
        >
          Öffnen →
        </span>
      </div>
    </Link>
  );
}
