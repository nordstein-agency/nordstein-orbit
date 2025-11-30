"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import OrbitButton, { OrbitButtonLink } from "@/components/orbit/OrbitButton";

import OrbitModal from "@/components/orbit/OrbitModal";

import AllianceButton from "@/components/alliance/AllianceButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { scoreLead } from "@/lib/leadScore";
import AllianceButtonMail from "@/components/orbit/AllianceButtonMail";

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
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [aiLoading, setAiLoading] = useState(false);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  const [credits, setCredits] = useState<number | null>(null);

  // MODALS
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  

  // ---------------------
  // Wallet laden
  // ---------------------
  useEffect(() => {
    async function loadWallet() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("orbit_credits")
        .select("credits")
        .eq("user_id", user.id)
        .single();

      setCredits(data?.credits ?? 0);
    }

    loadWallet();
  }, []);


  // ---------------------
  // Lead laden
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

      setScore({
        total: typedLead.score ?? 0,
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
  // AI Mail Template laden
  // ---------------------
  const [mailTemplate, setMailTemplate] = useState<any | null>(null);

  useEffect(() => {
    async function loadMail() {
      const { data, error } = await supabase
        .from("lead_mail_templates")
        .select("*")
        .eq("lead_id", String(id))
        .order("created_at", { ascending: false })
        .limit(1)
        .single();


      if (!error) {
        setMailTemplate(data);
      }
    }

    loadMail();
  }, [id]);


  // ---------------------
  // KI-Bewertung starten
  // → Aber zuerst das richtige Modal öffnen!
  // ---------------------
  function handleAiClick() {
    if (credits === null) return;

    if (credits < 1) {
      setShowNoCreditModal(true);
      return;
    }

    setShowConfirmModal(true);
  }


  // ---------------------
  // KI-Bewertung mit Credit-Abzug
  // ---------------------
  async function startAiEvaluation() {
    if (!lead) return;

    setShowConfirmModal(false);
    setAiLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Kein User");

      // 1️⃣ Credit abbuchen
      const spendRes = await fetch("/api/credits/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, amount: 1 }),
      });

      if (!spendRes.ok) {
        setShowNoCreditModal(true);
        setAiLoading(false);
        return;
      }

      // UI sofort aktualisieren
      setCredits((c) => (c !== null ? c - 1 : c));


      // 2️⃣ Make Webhook triggern
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

      if (!res.ok) throw new Error("Webhook Fehler");


      // 3️⃣ Polling
      let tries = 0;
      const MAX_TRIES = 30;

      while (tries < MAX_TRIES) {
        await new Promise((r) => setTimeout(r, 2000));

        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", lead.id)
          .single();

        if (error) break;

        if (data && data.signals && JSON.stringify(data.signals) !== JSON.stringify(lead.signals)) {
          setLead(data);
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
  // JSON Parsing für AI Output
  // ---------------------
  let ai: any = {};

  try {
    if (!lead?.signals) ai = {};
    else if (typeof lead.signals === "string") ai = JSON.parse(lead.signals);
    else if (typeof lead.signals === "object") ai = lead.signals;
    else ai = {};
  } catch {
    ai = {};
  }

    function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }


  // ---------------------
  // Loading State
  // ---------------------
  if (loading) return <div className="p-10 text-white/50">Lade Lead…</div>;
  if (!lead) return <div className="p-10 text-red-400">Lead nicht gefunden.</div>;


  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pt-16 pl-12 pr-8 max-w-5xl space-y-10">


      {/* =====================================================
          MODAL: KEINE CREDITS
      ===================================================== */}
      <OrbitModal open={showNoCreditModal} onClose={() => setShowNoCreditModal(false)}>
        <h2 className="text-xl font-semibold text-white mb-4">Keine Credits</h2>
        <p className="text-white/70 mb-6">
          Du benötigst <strong>1 Credit</strong>, um diesen Lead per KI zu analysieren.
        </p>

        <div className="flex justify-end gap-3">
          <OrbitButton onClick={() => setShowNoCreditModal(false)}>
            Abbrechen
          </OrbitButton>

          <OrbitButtonLink href="/wallet/buy" className="bg-[#B244FF] hover:bg-[#9A32E0]">
            Credits kaufen
          </OrbitButtonLink>
        </div>
      </OrbitModal>


      {/* =====================================================
          MODAL: 1 CREDIT BESTÄTIGUNG
      ===================================================== */}
      <OrbitModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <h2 className="text-xl font-semibold text-white mb-4">1 Credit verwenden?</h2>
        <p className="text-white/70 mb-6">
          Möchtest du jetzt eine KI-Analyse starten?  
          Das kostet <strong>1 Credit</strong>.
        </p>

        <div className="flex justify-end gap-3">
          <OrbitButton onClick={() => setShowConfirmModal(false)}>
            Abbrechen
          </OrbitButton>

          <AllianceButton onClick={startAiEvaluation}>
            Jetzt analysieren (1 Credit)
          </AllianceButton>
        </div>
      </OrbitModal>


      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {lead.company_name ?? "Unbekanntes Unternehmen"}
          </h1>

          <p className="text-white/50 text-sm">
            {lead.website ? (
              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="underline">
                {lead.website}
              </a>
            ) : "Keine Website"}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 items-end">

          <Link href="/leads">
            <OrbitButton className="w-40">← Zurück</OrbitButton>
          </Link>

          <AllianceButton
            onClick={handleAiClick}
            className="w-40"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analysiere…
              </div>
            ) : ("Bewerten (KI)")}
          </AllianceButton>

          <Link href={`/leads/${id}/edit`}>
            <OrbitButton className="w-40 bg-blue-600 hover:bg-blue-500">Bearbeiten</OrbitButton>
          </Link>

          <AllianceButtonMail
          leadId={lead.id}
          className="w-40"
            companyName={lead.company_name} 
            signals={lead.signals}
            />

        </div>
      </div>


      {/* =====================================================
          SCORE BADGE
      ===================================================== */}
      {score && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 inline-block">
          <p className="text-white/70 text-sm mb-1">Lead Score</p>
          <div className="text-4xl font-bold text-white">
            {score.total}
            <span className="text-xl text-white/40">/100</span>
          </div>
        </div>
      )}


      {/* =====================================================
          GRID (ALLE INFOS)
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


        {/* ### COMPANY INFO ### */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Unternehmensdaten</h2>
          <p className="text-white/70">Branche: {lead.industry ?? "—"}</p>
          <p className="text-white/70">Region: {lead.region ?? "—"}</p>
          <p className="text-white/70">Adresse: {lead.address ?? "—"}</p>
        </div>


        {/* ### CONTACT INFO ### */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Kontakt</h2>
          <p className="text-white/70">CEO: {lead.ceo ?? "—"}</p>
          <p className="text-white/70">E-Mail: {lead.email ?? "—"}</p>
          <p className="text-white/70">Telefon: {lead.phone ?? "—"}</p>
        </div>


        {/* ### SCORE BREAKDOWN ### */}
        {score && (
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
            <h2 className="text-xl text-white mb-6">Score Breakdown</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(score.breakdown).map(([key, value]) => (
                <div key={key} className="p-4 bg-black/20 rounded-lg border border-white/10">
                  <p className="text-white/50 text-sm">{key}</p>
                <p className="text-white text-2xl font-semibold">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ### AI STRATEGY ### */}
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
                  <p className="text-white/40 uppercase text-xs">Content Qualität</p>
                  <p>{ai.content_quality}</p>
                </div>
              )}

              {ai.website_quality && (
                <div>
                  <p className="text-white/40 uppercase text-xs">Website Qualität</p>
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
                  <p className="text-white/40 uppercase text-xs">Kaufbereitschaft</p>
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
                  <p className="text-white/40 uppercase text-xs">Budgetindikator</p>
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
                  <p className="text-white/40 uppercase text-xs">Pitch Ansatz</p>
                  <p className="text-white">{ai.pitch_ansatz}</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

              {/* ### AI MAIL TEMPLATE ### */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2">

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl text-white">AI Mail Template</h2>

          {mailTemplate && (
            <button
              onClick={() => copyToClipboard(mailTemplate.email_body ?? "")}
              className="text-white/60 hover:text-white transition"
              title="Copy to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                <rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>

        {!mailTemplate && (
          <p className="text-white/60 text-sm">
            Noch keine AI-E-Mail generiert…
          </p>
        )}

        {mailTemplate && (
          <div className="space-y-2">
            <p className="text-white/40 uppercase text-xs">Betreff</p>
            <p className="text-white font-semibold">{mailTemplate.email_subject}</p>

            <p className="text-white/40 uppercase text-xs mt-4">E-Mail</p>
            <pre className="text-white/70 text-sm whitespace-pre-wrap">
              {mailTemplate.email_body}
            </pre>
          </div>
        )}
      </div>


      {/* ### NOTIZEN ### */}
      <div className="mb-24 p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-xl text-white mb-3">Notizen</h2>
        <p className="text-white/70 whitespace-pre-wrap">
          {lead.notes ?? "Keine Notizen vorhanden..."}
        </p>
      </div>


    </div>
  );
}
