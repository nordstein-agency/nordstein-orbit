// src/app/alliance/partners/new/page.tsx

import { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import AlliancePartnerCreateForm from "@/components/alliance/AlliancePartnerCreateForm";
import { AllianceButtonLink } from "@/components/alliance/AllianceButton";

export default function NewAlliancePartnerPage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#120b10] to-[#0a0709] px-8 py-16 text-white">

      

      <div className="relative z-10 max-w-3xl mx-auto space-y-10">

        {/* HEADLINE */}
        <div className="flex items-center justify-between">
          <h1
            className="
              text-5xl font-extrabold tracking-tight relative
              bg-gradient-to-br from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
              bg-clip-text text-transparent
              drop-shadow-[0_0_18px_rgba(255,215,130,0.55)]
              [text-shadow:0_0_10px_rgba(255,235,180,0.55)]
            "
          >
            Neuer Alliance Partner
          </h1>

          <AllianceButtonLink href="/alliance/partners" className="w-48">
            Zurück
          </AllianceButtonLink>
        </div>

        {/* FORM */}
        <div className="bg-[#1f1620]/60 backdrop-blur-xl border border-[#3a2238] rounded-2xl p-10 shadow-xl">
          <AlliancePartnerCreateForm />
        </div>
      </div>
    </div>
  );
}
