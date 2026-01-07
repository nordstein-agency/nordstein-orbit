"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import OrbitButton, { OrbitButtonLink } from "@/components/orbit/OrbitButton";
import OrbitModal from "@/components/orbit/OrbitModal";
import AllianceButton from "@/components/alliance/AllianceButton";
import AllianceButtonMail from "@/components/orbit/AllianceButtonMail";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getWallet } from "@/actions/getWallet";

import { scoreLead } from "@/lib/leadScore";
import { addMinutesISO } from "@/lib/orbit/time/addMinutes";
import { businessLocalToUtc } from "@/lib/orbit/timezone";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";

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

  const [mailTemplate, setMailTemplate] = useState<any | null>(null);

  // MODALS
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [importing, setImporting] = useState(false);
const [imported, setImported] = useState(false);

const [history, setHistory] = useState<any[]>([]);



const LEAD_STATUSES = {
  Neu: "text-white/70",
  "Termin vereinbart": "text-green-400",
  "No-Show": "text-orange-400",
  "Erreicht, nochmals kontaktieren": "text-yellow-400",
  "Nicht erreicht": "text-blue-400",
  "Kein Interesse": "text-red-400",
} as const;

const [selectedStatus, setSelectedStatus] =
  useState<keyof typeof LEAD_STATUSES>("Neu");

const [showInlineDetails, setShowInlineDetails] = useState(false);

// Termin / Followup Inputs
const [appointmentType, setAppointmentType] = useState("");
const [followUpDate, setFollowUpDate] = useState("");
const [followUpTime, setFollowUpTime] = useState("");
const [followUpDuration, setFollowUpDuration] = useState("60");
const [followUpNote, setFollowUpNote] = useState("");

const [locationType, setLocationType] =
  useState<"office" | "online" | "other" | "">("");
const [locationValue, setLocationValue] = useState("");



  // ---------------------
  // Wallet laden
  // ---------------------
  useEffect(() => {
  async function loadWallet() {
    try {
      const wallet = await getWallet(); // Server Action statt Supabase
      setCredits(wallet?.credits ?? 0);
    } catch (err) {
      console.error("Wallet load error", err);
      setCredits(0);
    }
  }

  loadWallet();
}, []);


  // ---------------------
  // Lead laden (API)
  // ---------------------
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/orbit/get/lead/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Lead API error:", res.status);
        setLead(null);
        setLoading(false);
        return;
      }

      const data = await res.json();

      const typedLead = data as Lead;
      setLead(typedLead);
      setSelectedStatus(
  (typedLead.status as keyof typeof LEAD_STATUSES) ?? "Neu"
);

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
  // Mail Template laden (API)
  // ---------------------
  useEffect(() => {
    async function loadMail() {
      const res = await fetch(`/api/orbit/get/lead-mail-template/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setMailTemplate(data);
    }

    loadMail();
  }, [id]);

  // ---------------------
  // KI-Bewertung starten
  // ---------------------
  function handleAiClick() {
    if (credits === null) return;

    if (credits < 1) {
      setShowNoCreditModal(true);
      return;
    }

    setShowConfirmModal(true);
  }

  const handleStatusSelect = (status: keyof typeof LEAD_STATUSES) => {
  setSelectedStatus(status);

  // Sofort speichern (kein Inline-Panel)
  if (
    status === "Neu" ||
    status === "Kein Interesse" ||
    status === "No-Show"
  ) {
    updateLeadStatus(status);
    setShowInlineDetails(false);
    return;
  }

  setShowInlineDetails(true);
};


const updateLeadStatus = async (status: keyof typeof LEAD_STATUSES) => {
  const isAppointment = status === "Termin vereinbart";

  let starts_at: string | null = null;
  let ends_at: string | null = null;

  if (isAppointment) {
    if (!followUpDate || !followUpTime) {
      alert("Bitte Datum und Uhrzeit angeben");
      return;
    }

    const startUtc = businessLocalToUtc(
      `${followUpDate} ${followUpTime}`
    );

    const duration = Number(followUpDuration || "60");
    const endUtc = addMinutesISO(startUtc.toISOString(), duration);

    starts_at = startUtc.toISOString();
    ends_at = endUtc;
  }

  const res = await fetch("/api/orbit/update/followup-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "lead",
      source_id: lead!.id,
      user_id: lead!.owner,
      status,

      follow_up: {
        date: followUpDate,
        note: followUpNote,
      },

      appointment: isAppointment
        ? {
            type: appointmentType,
            starts_at,
            ends_at,
            locationType,
            locationValue,
          }
        : null,
    }),
  });

  if (!res.ok) {
    alert("Fehler beim Speichern");
    return;
  }

  // Reload history after change
  const h = await fetch(
    `/api/orbit/get/communication-history?source=lead&source_id=${lead!.id}`,
    { cache: "no-store" }
  );
  if (h.ok) setHistory(await h.json());

  setShowInlineDetails(false);
};


  async function handleImportToOne() {
  if (!lead) return;

  setImporting(true);

  try {
    const res = await fetch("/api/one/outgoing/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orbit_lead_id: lead.id,

        company_name: lead.company_name,
        website: lead.website,
        address: lead.address,
        email: lead.email,
        phone: lead.phone,
        ceo: lead.ceo,
        industry: lead.industry,

        owner: lead.owner, // 👈 geht später auf customers.user_id
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    setImported(true);
  } catch (err) {
    console.error(err);
    alert("Fehler beim Übernehmen in ONE");
  } finally {
    setImporting(false);
  }
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

      setCredits((c) => (c !== null ? c - 1 : c));

      // 2️⃣ Make Webhook ausführen
      await fetch(
        "https://hook.eu1.make.com/9mlgdwmvx18vryon2yvrtdii1exwlsem",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        }
      );

      // 3️⃣ Polling über API, nicht Supabase
      let tries = 0;
      const MAX_TRIES = 30;

      while (tries < MAX_TRIES) {
        await new Promise((r) => setTimeout(r, 2000));

        const res = await fetch(`/api/orbit/get/lead/${lead.id}`);
        if (!res.ok) break;

        const data = await res.json();

        if (
          data &&
          data.signals &&
          JSON.stringify(data.signals) !== JSON.stringify(lead.signals)
        ) {
          setLead(data);
          setScore({
            total: data.score ?? 0,
            breakdown: score?.breakdown ?? {},
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
  // JSON Parsing
  // ---------------------
  let ai: any = {};

  try {
    if (!lead?.signals) ai = {};
    else if (typeof lead.signals === "string")
      ai = JSON.parse(lead.signals);
    else ai = lead.signals;
  } catch {
    ai = {};
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // ---------------------
  // Loading States
  // ---------------------
  if (loading) return <div className="p-10 text-white/50">Lade Lead…</div>;
  if (!lead) return <div className="p-10 text-red-400">Lead nicht gefunden.</div>;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pt-16 pl-12 pr-8 max-w-5xl space-y-10">

      {/* -------------------------
          MODAL: KEINE CREDITS
      ---------------------------- */}
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

      {/* -------------------------
          MODAL: CONFIRM CREDIT
      ---------------------------- */}
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

      {/* -------------------------
          HEADER
      ---------------------------- */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {lead.company_name ?? "Unbekanntes Unternehmen"}
          </h1>

          <p className="text-white/50 text-sm">
            {lead.website ? (
              <a href={lead.website} target="_blank" className="underline">
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
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analysiere…
              </div>
            ) : "Bewerten (KI)"}
          </AllianceButton>

          <Link href={`/leads/${id}/edit`}>
            <OrbitButton className="w-40 bg-blue-600 hover:bg-blue-500">
              Bearbeiten
            </OrbitButton>
          </Link>

          <OrbitButton
            onClick={handleImportToOne}
            disabled={importing || imported}
            className={`
              w-40
              
              hover:bg-green-600/30
              
              shadow-[0_0_20px_#22c55e33]
            `}
          >
            {importing
              ? "Übertrage…"
              : imported
              ? "In ONE übernommen ✓"
              : "Übernehmen in ONE"}
          </OrbitButton>


          <AllianceButtonMail
            leadId={lead.id}
            className="w-40"
            companyName={lead.company_name}
            signals={lead.signals}
          />
        </div>
      </div>

      {/* -------------------------
          SCORE BADGE
      ---------------------------- */}
      {score && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 inline-block">
          <p className="text-white/70 text-sm mb-1">Lead Score</p>
          <div className="text-4xl font-bold text-white">
            {score.total}
            <span className="text-xl text-white/40">/100</span>
          </div>
        </div>
      )}

      {/* -------------------------
          GRID
      ---------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* COMPANY INFO */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Unternehmensdaten</h2>
          <p className="text-white/70">Branche: {lead.industry ?? "—"}</p>
          <p className="text-white/70">Region: {lead.region ?? "—"}</p>
          <p className="text-white/70">Adresse: {lead.address ?? "—"}</p>
        </div>

        {/* CONTACT */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-4">Kontakt</h2>
          <p className="text-white/70">CEO: {lead.ceo ?? "—"}</p>
          <p className="text-white/70">E-Mail: {lead.email ?? "—"}</p>
          <p className="text-white/70">Telefon: {lead.phone ?? "—"}</p>
        </div>

        {/* Kommunikationshistorie */}
<div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 md:col-span-2">
  <h3 className="text-white font-semibold">
    Kommunikationshistorie
  </h3>

  {history.length === 0 ? (
    <p className="text-white/40 text-sm">
      Noch keine Aktivitäten vorhanden
    </p>
  ) : (
    <div className="divide-y divide-white/10">
      {history.map((item) => (
        <div key={item.id} className="py-3">
          <p className="text-sm text-white font-medium">
            {item.title}
          </p>

          {item.description && (
            <p className="text-xs text-white/50 mt-1">
              {item.description}
            </p>
          )}

          <p className="text-xs text-white/30 mt-1">
            {new Date(
              item.starts_at ?? item.created_at
            ).toLocaleString("de-AT")}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

{/* STATUS PANEL */}
<div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 md:col-span-2">
  <h3 className="text-white font-semibold">
    Status setzen
  </h3>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {(Object.keys(LEAD_STATUSES) as Array<
      keyof typeof LEAD_STATUSES
    >).map((status) => (
      <button
        key={status}
        onClick={() => handleStatusSelect(status)}
        className={`
          p-4 rounded-xl border border-white/10 bg-white/5
          text-left transition hover:bg-white/10
          ${selectedStatus === status ? "ring-2 ring-[#B244FF]" : ""}
        `}
      >
        <p className={`text-sm font-semibold ${LEAD_STATUSES[status]}`}>
          {status}
        </p>
        <p className="text-xs text-white/40 mt-1">
          Status setzen
        </p>
      </button>
    ))}
  </div>
</div>


{/* Inline Detail Panel */}
<div
  className={`
    overflow-hidden transition-all duration-300 ease-out
    ${showInlineDetails ? "max-h-[900px] opacity-100 mt-6" : "max-h-0 opacity-0"}
  `}
>
  <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">

    {selectedStatus === "Termin vereinbart" ? (
      <>
        <h3 className="text-white font-semibold">
          Termin vereinbaren
        </h3>

        <OrbitDropdown
          value={appointmentType}
          placeholder="Art des Termins"
          options={[
            { label: "Vorstellungsgespräch", value: "Vorstellungsgespräch" },
            { label: "Verkaufsgespräch", value: "Verkaufsgespräch" },
            { label: "Veranstaltung", value: "Veranstaltung" },
          ]}
          onChange={setAppointmentType}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
          />
          <input
            type="time"
            value={followUpTime}
            onChange={(e) => setFollowUpTime(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
          />
        </div>

        <OrbitDropdown
          value={followUpDuration}
          placeholder="Dauer"
          options={[
            { label: "30 Minuten", value: "30" },
            { label: "60 Minuten", value: "60" },
            { label: "90 Minuten", value: "90" },
          ]}
          onChange={setFollowUpDuration}
        />

        {/* Ort */}
        <div className="space-y-2">
          <p className="text-sm text-white/70 font-medium">
            Ort des Termins
          </p>

          <div className="flex gap-4">
            {[
              { key: "office", label: "Im Büro" },
              { key: "online", label: "Online" },
              { key: "other", label: "Anderer Ort" },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 text-sm text-white/70 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={locationType === opt.key}
                  onChange={() => setLocationType(opt.key as any)}
                  className="accent-[#B244FF]"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <input
            type="text"
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
          />
        </div>
      </>
    ) : (
      <>
        <h3 className="text-white font-semibold">
          Nächstes Follow-Up
        </h3>

        <input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
        />

        <textarea
          placeholder="Notiz"
          value={followUpNote}
          onChange={(e) => setFollowUpNote(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
        />
      </>
    )}

    <div className="flex justify-end gap-3 pt-2">
      <OrbitButton
        variant="secondary"
        onClick={() => setShowInlineDetails(false)}
      >
        Abbrechen
      </OrbitButton>

      <OrbitButton
        onClick={() => updateLeadStatus(selectedStatus)}
      >
        Speichern
      </OrbitButton>
    </div>
  </div>
</div>


        {/* SCORE BREAKDOWN */}
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

        {/* AI STRATEGY */}
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

              {Object.entries(ai).map(([key, value]) => {
                if (key === "score_0_100") return null;
                return (
                  <div key={key}>
                    <p className="text-white/40 uppercase text-xs">{key}</p>
                    <p>{String(value)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI MAIL TEMPLATE */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl text-white">AI Mail Template</h2>

            {mailTemplate && (
              <button
                onClick={() => copyToClipboard(mailTemplate.email_body ?? "")}
                className="text-white/60 hover:text-white transition"
                title="Copy to clipboard"
              >
                📋
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

        {/* NOTES */}
        <div className="mb-24 p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl text-white mb-3">Notizen</h2>
          <p className="text-white/70 whitespace-pre-wrap">
            {lead.notes ?? "Keine Notizen vorhanden..."}
          </p>
        </div>
      </div>
    </div>
  );
}
