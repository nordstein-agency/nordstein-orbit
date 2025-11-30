"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { scoreLead } from "@/lib/leadScore";
import AllianceButton from "@/components/alliance/AllianceButton";

// ---------------------
// Lead Typ
// ---------------------
export type Lead = {
  id: string;
  created_at: string;
  company_name: string | null;
  website: string | null;
  score: number | null;
  status: string | null;
  industry: string | null;
  region: string | null;
  signals: any | null;
  owner: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  socials: any | null;
  ceo: string | null;
  manual_score?: number | null;
  ai_strategy?: string | null;
  notes?: string | null;
};

// ---------------------
// Page Component
// ---------------------
export default function LeadDetailPage() {
  const { id } = useParams();
  const supabase = createSupabaseBrowserClient();

  const [lead, setLead] = useState<Lead | null>(null);
  const [score, setScore] = useState<
    | {
        total: number;
        breakdown: {
          industry: number;
          region: number;
          signals: number;
          ceo: number;
          manual: number;
        };
      }
    | null
  >(null);
  const [loading, setLoading] = useState(true);

  const [scoreLoading, setScoreLoading] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);


  // ---------------------
  // Load lead
  // ---------------------
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const typedLead = data as Lead;
      setLead(typedLead);

      const dbScore = typedLead.score ?? 0;

      setScore({
        total: dbScore,
        breakdown: {
          industry: 0,
          region: 0,
          signals: 0,
          ceo: 0,
          manual: 0,
        },
      });

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------
  // Score neu berechnen
  // ---------------------
  async function handleRecalculateScore() {
    if (!lead) return;

    setScoreLoading(true);

    const newScore = scoreLead(lead);
    setScore(newScore);

    await supabase.from("leads").update({ score: newScore.total }).eq("id", id);

    setScoreLoading(false);
  }

  async function handleAiScore() {
  if (!lead) return;

  setAiLoading(true);

  try {
    // 1) Make Trigger auslösen
    const res = await fetch(
      "https://hook.eu1.make.com/9mlgdwmvx18vryon2yvrtdii1exwlsem",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          company_name: lead.company_name,
          website: lead.website,
          email: lead.email,
          industry: lead.industry,
          region: lead.region,
          ceo: lead.ceo,
          socials: lead.socials,
          signals: lead.signals,
        }),
      }
    );

    if (!res.ok) throw new Error("KI-WebHook Fehler");

    // 2) Polling starten (alle 2s)
    let tries = 0;
    const MAX_TRIES = 30; // 1 Minute warten

    while (tries < MAX_TRIES) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", lead.id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        break;
      }

      // Signals verändert? Dann refresh!
      if (data && data.signals && JSON.stringify(data.signals) !== JSON.stringify(lead.signals)) {
  // Lead updaten
  setLead(data);

  // SCORE aus Supabase übernehmen
  setScore({
    total: data.score ?? 0,
    breakdown: score?.breakdown ?? {
      industry: 0,
      region: 0,
      signals: 0,
      ceo: 0,
      manual: 0,
    },
  });

  setAiLoading(false);
  return;
}


      tries++;
    }

    setAiLoading(false);
  } catch (err) {
    console.error(err);
    setAiLoading(false);
  }
}


  // ---------------------
  // Enrichment via API
  // ---------------------
  async function handleEnrich() {
    if (!lead) return;
    setEnrichLoading(true);

    try {
      const res = await fetch("/api/leads/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });

      if (!res.ok) {
        console.error("Enrich-Fehler:", await res.text());
        alert("Enrichment fehlgeschlagen.");
        setEnrichLoading(false);
        return;
      }

      const enriched = await res.json();

      const updatedLead: Lead = {
        ...lead,
        industry: enriched.industry ?? lead.industry,
        region: enriched.region ?? lead.region,
        ceo: enriched.ceo ?? lead.ceo,
        socials: {
          ...(lead.socials ?? {}),
          ...(enriched.socials ?? {}),
        },
        signals: enriched.signals ?? lead.signals,
      };

      const { error } = await supabase
        .from("leads")
        .update({
          industry: updatedLead.industry,
          region: updatedLead.region,
          ceo: updatedLead.ceo,
          socials: updatedLead.socials,
          signals: updatedLead.signals,
        })
        .eq("id", lead.id);

      if (error) {
        console.error(error);
        alert("Fehler beim Speichern des Enrichments.");
        setEnrichLoading(false);
        return;
      }

      setLead(updatedLead);
      setScore(scoreLead(updatedLead));
    } catch (e) {
      console.error(e);
      alert("Unerwarteter Fehler beim Enrichment.");
    } finally {
      setEnrichLoading(false);
    }
  }

  // ---------------------
  // Loading + Not found
  // ---------------------
  if (loading) {
    return <div className="p-10 text-white/50">Lade Lead…</div>;
  }

  if (!lead) {
    return <div className="p-10 text-red-400">Lead nicht gefunden.</div>;
  }

  // ---------------------
  // AI JSON sauber parsen
  // ---------------------
  // AI JSON sicher parsen, egal ob String, Objekt, null oder undefined
let ai: any = {};

try {
  if (!lead.signals) {
    ai = {};
  } else if (typeof lead.signals === "string") {
    ai = JSON.parse(lead.signals);
  } else if (typeof lead.signals === "object") {
    ai = lead.signals; // bereits geparst aus der DB
  } else {
    ai = {};
  }
} catch (err) {
  console.error("AI JSON PARSE ERROR:", err);
  ai = {};
}

    // ---------------------

  return (
    <div className="pt-16 pl-12 pr-8 max-w-5xl space-y-10">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {String(lead.company_name ?? "Unbekanntes Unternehmen")}
          </h1>

          <p className="text-white/50 text-sm">
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                className="underline"
                rel="noopener noreferrer"
              >
                {String(lead.website)}
              </a>
            ) : (
              "Keine Website"
            )}
          </p>
        </div>

        {/* Buttons rechts */}
        <div className="flex flex-col gap-3 items-end">
          <Link href="/leads">
            <OrbitButton className="w-40">← Zurück</OrbitButton>
          </Link>

          <AllianceButton
  onClick={handleAiScore}
  className="w-40"
  disabled={aiLoading}
>
  {aiLoading ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
      Analysiere…
    </div>
  ) : (
    "Bewerten (KI)"
  )}
</AllianceButton>


          <Link href={`/leads/${id}/edit`}>
            <OrbitButton className="w-40 bg-blue-600 hover:bg-blue-500">
              Bearbeiten
            </OrbitButton>
          </Link>
        </div>
      </div>

      {/* SCORE BADGE */}
      {score && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 inline-block">
          <p className="text-white/70 text-sm mb-1">Lead Score</p>
          <div className="text-4xl font-bold text-white">
            {String(score.total)}
            <span className="text-xl text-white/40">/100</span>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Info */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Unternehmensdaten</h2>
          <p className="text-white/70">Branche: {String(lead.industry ?? "—")}</p>
          <p className="text-white/70">Region: {String(lead.region ?? "—")}</p>
          <p className="text-white/70">Adresse: {String(lead.address ?? "—")}</p>
        </div>

        {/* Contact Info (CEO hier rein) */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Kontakt</h2>
          <p className="text-white/70">
            CEO: {String(lead.ceo ?? "Keine Angabe")}
          </p>
          <p className="text-white/70">E-Mail: {String(lead.email ?? "—")}</p>
          <p className="text-white/70">Telefon: {String(lead.phone ?? "—")}</p>
        </div>

        {/* Score Breakdown */}
        {score && (
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
            <h2 className="text-xl text-white mb-6">Score Breakdown</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                Object.entries(score.breakdown) as [string, number][]
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="p-4 bg-black/20 rounded-lg border border-white/10"
                >
                  <p className="text-white/50 text-sm">{String(key)}</p>
                  <p className="text-white text-2xl font-semibold">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 AI SALES STRATEGY – ersetzt "Signals" */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
          <h2 className="text-xl text-white mb-3">AI Sales Strategy</h2>

          {!lead.signals && (
            <p className="text-white/60">Noch keine KI-Analyse durchgeführt…</p>
          )}

          {ai && (
            <div className="space-y-4 text-white/70 text-sm whitespace-pre-wrap">

              {ai.score_0_100 && (
                <div className="text-4xl font-bold text-white mb-4">
                  {ai.score_0_100}/100
                </div>
              )}

              {ai.auffindbarkeit && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Auffindbarkeit</p>
                  <p>{ai.auffindbarkeit}</p>
                </div>
              )}

              {ai.social_media && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Social Media</p>
                  <p>{ai.social_media}</p>
                </div>
              )}

              {ai.content_quality && (
                <div>
                  <p className="text-white/40 uppercase text-xs">
                    Content Qualität
                  </p>
                  <p>{ai.content_quality}</p>
                </div>
              )}

              {ai.website_quality && (
                <div>
                  <p className="text-white/40 uppercase text-xs">
                    Website Qualität
                  </p>
                  <p>{ai.website_quality}</p>
                </div>
              )}

              {ai.tracking && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Tracking</p>
                  <p>{ai.tracking}</p>
                </div>
              )}

              {ai.funnel && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Funnel</p>
                  <p>{ai.funnel}</p>
                </div>
              )}

              {ai.kauf_signale && (
                <div>
                  <p className="text-white/40 uppercase text-xs">
                    Kaufbereitschaft
                  </p>
                  <p>{ai.kauf_signale}</p>
                </div>
              )}

              {ai.agenturbindung && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Agenturbindung</p>
                  <p>{ai.agenturbindung}</p>
                </div>
              )}

              {ai.entscheider && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Entscheider</p>
                  <p>{ai.entscheider}</p>
                </div>
              )}

              {ai.budget_indikator && (
                <div>
                  <p className="text-white/40 uppercase text-xs">
                    Budgetindikator
                  </p>
                  <p>{ai.budget_indikator}</p>
                </div>
              )}

              {ai.schwachstellen && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Schwachstellen</p>
                  <p>{ai.schwachstellen}</p>
                </div>
              )}

              {ai.pitch_ansatz && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white/40 uppercase text-xs">
                    Pitch Ansatz
                  </p>
                  <p className="text-white">{ai.pitch_ansatz}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ZUSÄTZLICHE KARTEN */}
      <div className="grid grid-cols-1 gap-8">
        {/* AI STRATEGY (Text aus DB bleibt unverändert) */}
        

        {/* Notizen */}
        <div className="mb-24 p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-3">Notizen</h2>
          <p className="text-white/70 whitespace-pre-wrap">
            {String(lead.notes ?? "Keine Notizen vorhanden...")}
          </p>
        </div>
      </div>
    </div>
  );
}
