"use client";
import Link from "next/link";
import OrbitButton from "@/components/orbit/OrbitButton";

import AllianceLayout from "@/components/alliance/AllianceLayout";
import AllianceSection from "@/components/alliance/AllianceSection";
import AllianceHeading from "@/components/alliance/AllianceHeading";
import AllianceCard from "@/components/alliance/AllianceCard";
import { AllianceButtonLink } from "@/components/alliance/AllianceButton";

export default function AlliancePage() {
  return (
    <AllianceLayout>

      {/* Breadcrumb */}
      <p className="text-[11px] font-semibold tracking-[0.25em] text-[#d8a5d0] uppercase">
        Nordstein Orbit
      </p>

      {/* ========================== */}
      {/* 🔥 Title + Subtitle */}
      {/* ========================== */}
      <h1
        className="
          gold-shine text-5xl font-extrabold tracking-tight 
          bg-gradient-to-br from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
          bg-clip-text text-transparent relative inline-block
          drop-shadow-[0_0_18px_rgba(255,215,130,0.55)]
        "
      >
        Nordstein Alliance
      </h1>

        <AllianceButtonLink 
  href="/alliance/overview" 
  className="w-48"
>
  Zur Übersicht
</AllianceButtonLink>
      

      <p className="text-lg text-[#c9b5c7] leading-relaxed mt-4 max-w-3xl">
        Das strategische Partnernetzwerk von Nordstein:  
        Agenturen, Spezialisten & Fulfillment-Partner, die gemeinsam Projekte,
        Upsells und Kundenservice auf ein neues Level bringen.
      </p>

      {/* ========================== */}
      {/* 🔥 Section 1 — Was ist die Alliance */}
      {/* ========================== */}
      <AllianceSection>
        <AllianceHeading>Was ist die Nordstein Alliance?</AllianceHeading>

        <p className="text-[#d3c4d1] leading-relaxed">
          Die <strong>Nordstein Alliance</strong> ist ein Partnernetzwerk innerhalb
          der Nordstein-Struktur.  
          Es verbindet ausgewählte Agenturen, Freelancer und Spezialisten zu einem Netzwerk
          aus Fulfillment-Power, während Nordstein Strategie, Vertrieb und
          Projektmanagement liefert.
        </p>

        <p className="text-[#d3c4d1] leading-relaxed">
          Dadurch entstehen exklusive Upsell-Potenziale, Cross-Agency-Synergien und
          ein geschütztes Umfeld mit klaren Rollen & vertraglichen Mechanismen.
        </p>
      </AllianceSection>

      {/* ========================== */}
      {/* 🔥 Section 2 — Vorteile */}
      {/* ========================== */}
      <AllianceSection>
        <AllianceHeading>Vorteile für Partner</AllianceHeading>

        <div className="grid md:grid-cols-2 gap-6">
          <AllianceCard 
            title="Gemeinsame Kundenbetreuung"
            desc="Durch Co-Service mit Nordstein erhält jeder Partner Zugang zu bestehenden Projekten & Kunden – die Grundlage für hochwertige Upsells."
          />

          <AllianceCard 
            title="Fair verteilte Rollen"
            desc="Partner liefern Fulfillment, Nordstein übernimmt Strategie, Vertrieb & PM."
          />

          <AllianceCard 
            title="Upsell-Potenziale"
            desc="Gemeinsame Betreuung eröffnet neue Möglichkeiten: Web → Ads → SEO → Video usw."
          />

          <AllianceCard 
            title="Geschützte Verträge"
            desc="Klare Vereinbarungen sichern Rollen, Kunden & Revenue-Splits."
          />
        </div>
      </AllianceSection>

      {/* ========================== */}
      {/* 🔥 Section 3 — Roadmap */}
      {/* ========================== */}
      

    </AllianceLayout>
  );
}
