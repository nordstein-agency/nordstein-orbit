// src/app/alliance/partners/page.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AllianceTable from "@/components/alliance/AllianceTable";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import { AllianceButtonLink } from "@/components/alliance/AllianceButton";

export default async function AlliancePartnersPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  const { data: partners } = await supabase
    .from("alliance_partners")
    .select("id, created_at, user_id, partner_role, status");

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a0f17] to-[#120b10] px-8 py-12 text-white">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-14 flex items-center justify-between">

        {/* ULTRA GOLD */}
        <h1
          className="
            text-5xl font-extrabold tracking-tight relative
            bg-gradient-to-br from-[#fff3c4] via-[#e4c46d] via-[#d4a843] to-[#b88a2a]
            bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,215,130,0.55)]
            [text-shadow:0_0_10px_rgba(255,235,180,0.55),0_0_25px_rgba(255,200,120,0.35)]
          "
        >
          Alliance Partner Directory
          <span
            className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent blur-[18px] opacity-30 pointer-events-none"
          />
        </h1>

        <AllianceButtonLink 
          href="/alliance/overview" 
          className="w-48"
        >
          Zur Übersicht
        </AllianceButtonLink>
      </div>

      {/* PREMIUM CTA — full width, but max-w-6xl */}
<div className="max-w-6xl mx-auto mb-12">
  <div
    className="
      group relative overflow-hidden rounded-2xl p-8
      bg-gradient-to-br from-[#2a1b29]/60 via-[#3a2238]/40 to-[#1f1620]/60
      border border-[#b88a2a]/20 backdrop-blur-xl
      shadow-[0_0_25px_rgba(255,225,170,0.08)]
      animate-fade-in w-full
    "
  >
    {/* Hintergrund-Goldschein */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-10 right-0 w-[300px] h-[300px] 
        bg-[#b88a2a]/20 blur-[120px] rounded-full" />
    </div>

    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div>
        <h2
          className="text-2xl font-extrabold bg-gradient-to-br
          from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
          bg-clip-text text-transparent
          drop-shadow-[0_0_15px_rgba(255,215,130,0.45)]"
        >
          Neuen Alliance Partner hinzufügen
        </h2>

        <p className="text-[#d7c4d5] mt-2">
          Erstelle einen neuen Premium-Partner und integriere ihn in die Nordstein Alliance.
        </p>
      </div>

      <AllianceButtonLink
        href="/alliance/partners/new"
        className="w-48"
      >
        + Alliance Partner
      </AllianceButtonLink>
    </div>

    {/* Shine Effekt */}
    <div className="pointer-events-none absolute inset-0 opacity-0 
      group-hover:opacity-100 transition duration-700">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
        blur-xl animate-shine" />
    </div>
  </div>
</div>



      {/* TABLE */}
      <div className="max-w-6xl mx-auto">
        <AllianceTable partners={partners || []} />
      </div>

    </div>
  );
}
