// src/app/alliance/partner/[id]/page.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import Link from "next/link";

export default async function AlliancePartnerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

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

  // 1) Partner holen
  const { data: partner } = await supabase
    .from("alliance_partners")
    .select("*")
    .eq("id", id)
    .single();

  if (!partner) {
    return (
      <div className="text-center text-white mt-24 text-xl">
        Kein Partner gefunden.
      </div>
    );
  }

  // 2) User holen
  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, email, phone, company")
    .eq("id", partner.user_id)
    .single();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a0f17] to-[#120b10] px-8 py-12 text-white">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-14 flex items-center justify-between">

        {/* Ultra-Gold */}
        <h1
          className="
            text-5xl font-extrabold tracking-tight relative bg-gradient-to-br
            from-[#fff3c4] via-[#e4c46d] via-[#d4a843] to-[#b88a2a]
            bg-clip-text text-transparent
            drop-shadow-[0_0_18px_rgba(255,215,130,0.55)]
            [text-shadow:0_0_10px_rgba(255,235,180,0.55),0_0_25px_rgba(255,200,120,0.35)]
          "
        >
          Partner Details
          <span
            className="absolute inset-0 bg-gradient-to-br 
            from-white/40 via-transparent to-transparent blur-[18px] opacity-30 pointer-events-none"
          />
        </h1>

        <OrbitButtonLink href="/alliance/partners" variant="secondary">
          Zurück
        </OrbitButtonLink>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto space-y-10">

        {/* PARTNER CARD */}
        <div className="bg-[#1f1620]/60 border border-[#3a2238] rounded-2xl p-8 backdrop-blur-xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">
            {user?.full_name || "Unbekannter Nutzer"}
          </h2>

          <p className="text-[#cbb8c8] mb-6">
            Partner seit:{" "}
            <span className="text-white font-medium">
              {new Date(partner.created_at).toLocaleDateString("de-DE")}
            </span>
          </p>

          {/* BADGES */}
          <div className="flex gap-3 mb-6">
            {/* ROLE */}
            <span
              className="
                px-3 py-1 rounded-full text-xs font-semibold
                bg-gradient-to-br from-[#e4c46d] to-[#b88a2a] text-black
              "
            >
              {partner.partner_role || "Role fehlt"}
            </span>

            {/* STATUS */}
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${
                  partner.status === "active"
                    ? "bg-gradient-to-br from-[#e4c46d] to-[#b88a2a] text-black"
                    : partner.status === "paused"
                    ? "bg-[#6e4f20]/50 text-[#e8d9bf]"
                    : "bg-[#442020] text-[#f0c0c0]"
                }
              `}
            >
              {partner.status || "Status fehlt"}
            </span>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-2 text-[#cbb8c8]">
            <p><strong>Email:</strong> {user?.email || "—"}</p>
            <p><strong>Telefon:</strong> {user?.phone || "—"}</p>
            <p><strong>Firma:</strong> {user?.company || "—"}</p>
          </div>

          <div className="mt-8">
            <OrbitButtonLink
              href={`/alliance/partner/${id}/edit`}
              variant="primary"
              className="w-full md:w-auto"
            >
              Partner bearbeiten
            </OrbitButtonLink>
          </div>
        </div>

        {/* FUTURE SECTIONS */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Projekte */}
          <div className="bg-[#1f1620]/50 border border-[#2c1d2b] rounded-xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">Projekte</h3>
            <p className="text-[#b9a8b6]">
              (coming soon) – Zeigt alle Projekte, die mit diesem Partner laufen.
            </p>
          </div>

          {/* Performance */}
          <div className="bg-[#1f1620]/50 border border-[#2c1d2b] rounded-xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">Performance</h3>
            <p className="text-[#b9a8b6]">
              (coming soon) – KPIs, Qualitätsscore, Response Time, Auslastung.
            </p>
          </div>

          {/* Verträge */}
          <div className="bg-[#1f1620]/50 border border-[#2c1d2b] rounded-xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">Verträge & Dokumente</h3>
            <p className="text-[#b9a8b6]">
              (coming soon) – Vertragsstatus, White-Label Agreements, Schutzmechanismen.
            </p>
          </div>

          {/* Matching Score */}
          <div className="bg-[#1f1620]/50 border border-[#2c1d2b] rounded-xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-3">Matching Score</h3>
            <p className="text-[#b9a8b6]">
              (coming soon) – KI-Einschätzung, für welche Kunden/Projekte dieser Partner ideal ist.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
