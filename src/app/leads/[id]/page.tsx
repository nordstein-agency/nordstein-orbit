"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { scoreLead } from "@/lib/leadScore";

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
      setScore(scoreLead(typedLead));
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

  try {
    const res = await fetch("https://hook.eu1.make.com/t6xab47u62278tmjqk3wekj7hl8yt9r7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    });

    if (!res.ok) {
      throw new Error("Webhook returned error");
    }

    alert("Lead wird von KI analysiert. Ergebnis erscheint in Kürze!");
  } catch (err) {
    console.error(err);
    alert("Fehler beim Senden an KI-Analyse.");
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
        signals: {
          ...(lead.signals ?? {}),
          ...(enriched.signals ?? {}),
        },
      };

      // In Supabase speichern
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

      // State aktualisieren
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

  <OrbitButton onClick={handleAiScore} className="w-40">
    Bewerten (KI)
  </OrbitButton>

  <OrbitButton
    onClick={handleEnrich}
    disabled={enrichLoading}
    className="w-40 bg-emerald-600 hover:bg-emerald-500"
  >
    {enrichLoading ? "Enrichen…" : "Enrich"}
  </OrbitButton>

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

        {/* Contact Info */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Kontakt</h2>
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

        {/* CEO Info */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-3">CEO / Founder</h2>
          <p className="text-white/70">{String(lead.ceo ?? "Keine Angabe")}</p>

          <div className="mt-3 space-y-1 text-sm text-white/60">
            {lead.socials?.linkedin && (
              <a
                href={lead.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline block"
              >
                LinkedIn
              </a>
            )}
            {lead.socials?.instagram && (
              <a
                href={lead.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline block"
              >
                Instagram
              </a>
            )}
          </div>
        </div>

        {/* Signals */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-3">Signals</h2>
          <pre className="text-white/70 text-sm whitespace-pre-wrap">
            {String(JSON.stringify(lead.signals ?? {}, null, 2))}
          </pre>
        </div>
      </div>
    </div>
  );
}
 