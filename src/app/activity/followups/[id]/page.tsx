// src/app/activity/followups/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { businessLocalToUtc } from "@/lib/orbit/timezone";
import { addMinutesISO } from "@/lib/orbit/time/addMinutes";

/* -------------------------------------------------
 Types
------------------------------------------------- */
type FollowUpBase = {
  id: string;
  source_id: string;
  date: string | null;
  note: string | null;
  done: boolean;
  user_id: string;
};

type Application = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Lead = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
};

const FOLLOWUP_STATUSES = {
  Neu: "text-white/70",
  "Termin vereinbart": "text-green-400",
  "Erreicht, nochmals kontaktieren": "text-yellow-400",
  "Nicht erreicht": "text-blue-400",
  "Kein Interesse": "text-red-400",
} as const;

/* -------------------------------------------------
 Helpers
------------------------------------------------- */
function parseISODate(date?: string | null) {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/* -------------------------------------------------
 Page
------------------------------------------------- */
export default function FollowUpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<"application" | "lead" | null>(null);
  const [followUp, setFollowUp] = useState<FollowUpBase | null>(null);

  const [application, setApplication] = useState<Application | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<keyof typeof FOLLOWUP_STATUSES>("Neu");
  const [showInlineDetails, setShowInlineDetails] = useState(false);

  // 🔁 EXAKT WIE IN APPLICATION PAGE
  const [appointmentType, setAppointmentType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpDuration, setFollowUpDuration] = useState("60");

  const [locationType, setLocationType] =
    useState<"office" | "online" | "other" | "">("");
  const [locationValue, setLocationValue] = useState("");

  const [followUpNote, setFollowUpNote] = useState("");

  const [history, setHistory] = useState<any[]>([]);


  /* -------------------------------------------------
     Load
  ------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/orbit/get/followup/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error();

        const data = await res.json();
        setSource(data.source);
        setFollowUp(data.followup);

        if (data.source === "application") {
          const r = await fetch(
            `/api/orbit/get/applications/${data.followup.source_id}`,
            { cache: "no-store" }
          );
          if (r.ok) setApplication(await r.json());
        }

        if (data.source === "lead") {
          const r = await fetch(
            `/api/orbit/get/leads/${data.followup.source_id}`,
            { cache: "no-store" }
          );
          if (r.ok) setLead(await r.json());
        }

        // --------------------------------------------------
        // 📜 Kommunikationshistorie laden
        // --------------------------------------------------
        const historyRes = await fetch(
        `/api/orbit/get/communication-history?source=${data.source}&source_id=${data.followup.source_id}`,
        { cache: "no-store" }
        );

        if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
}




      } catch {
        router.push("/activity/followups");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  /* -------------------------------------------------
     Status Handling
  ------------------------------------------------- */
  const handleStatusSelect = (status: keyof typeof FOLLOWUP_STATUSES) => {
    setSelectedStatus(status);

    if (status === "Neu" || status === "Kein Interesse") {
      updateFollowUpStatus(status);
      setShowInlineDetails(false);
      return;
    }

    setShowInlineDetails(true);
  };



  const updateFollowUpStatus = async (status: keyof typeof FOLLOWUP_STATUSES) => {
  const isAppointment = status === "Termin vereinbart";

  let starts_at: string | null = null;
  let ends_at: string | null = null;

  if (isAppointment) {
    if (!followUpDate || !followUpTime) {
      alert("Bitte Datum und Uhrzeit angeben");
      return;
    }

    // 👉 LOKALE ZEIT → UTC
    const startUtc = businessLocalToUtc(
      `${followUpDate} ${followUpTime}`
    );

    const duration = Number(followUpDuration || "60");

    const endUtc = addMinutesISO(startUtc.toISOString(), duration);

    starts_at = startUtc.toISOString();
    ends_at = endUtc;
  }

    if (!followUp || !source) return;

    const res = await fetch("/api/orbit/update/followup-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followup_id: followUp.id,
        source,
        source_id: followUp.source_id,
        user_id: followUp.user_id,
        status,

        follow_up: {
          date: followUpDate,
          note: followUpNote,
        },

        appointment:
        isAppointment
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

    router.push("/activity/followups");
  };

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
  if (loading || !followUp || !source) {
    return (
      <div className="px-6 pt-20 text-white/50">
        Follow Up wird geladen…
      </div>
    );
  }

  const dueDate = parseISODate(followUp.date);

  return (
    <div className="pb-20 space-y-8 max-w-7xl">
      <OrbitButton
        variant="secondary"
        onClick={() => router.push("/activity/followups")}
      >
        ← Zurück
      </OrbitButton>

      <div>
        <p className="text-xs uppercase tracking-widest text-[#d8a5d0]">
          Follow Up · {source === "application" ? "Bewerbung" : "Lead"}
        </p>
        <h1 className="text-2xl font-semibold text-white mt-1">
          {source === "application"
            ? application?.name ?? "—"
            : lead?.company_name ?? "—"}
        </h1>


        {/* APPLICATION DETAILS */}
        {source === "application" && application && (
  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
    <p className="text-xs uppercase tracking-widest text-white/40">
      Bewerbungsdetails
    </p>

    <div className="text-sm text-white/80 space-y-1">
      <p>
        <span className="text-white/40">Name:</span>{" "}
        {application.name}
      </p>

      {application.email && (
        <p>
          <span className="text-white/40">E-Mail:</span>{" "}
          {application.email}
        </p>
      )}

      {application.phone && (
        <p>
          <span className="text-white/40">Telefon:</span>{" "}
          {application.phone}
        </p>
      )}
    </div>
  </div>
)}



{/* LEAD DETAILS */}
{source === "lead" && lead && (
  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
    <p className="text-xs uppercase tracking-widest text-white/40">
      Lead-Details
    </p>

    <div className="text-sm text-white/80 space-y-1">
      <p>
        <span className="text-white/40">Firma:</span>{" "}
        {lead.company_name}
      </p>

      {lead.contact_name && (
        <p>
          <span className="text-white/40">Kontakt:</span>{" "}
          {lead.contact_name}
        </p>
      )}

      {lead.email && (
        <p>
          <span className="text-white/40">E-Mail:</span>{" "}
          {lead.email}
        </p>
      )}

      {lead.phone && (
        <p>
          <span className="text-white/40">Telefon:</span>{" "}
          {lead.phone}
        </p>
      )}
    </div>
  </div>
)}



{/* Kommunikationshistorie */}
<div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
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



      </div>

      {/* Status Cards */}
      <div>
        <h2 className="text-lg text-white font-semibold mb-4">
          Status setzen
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.keys(FOLLOWUP_STATUSES) as Array<
            keyof typeof FOLLOWUP_STATUSES
          >).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`
                p-5 rounded-xl border border-white/10 bg-white/5
                text-left transition hover:bg-white/10
                ${selectedStatus === status ? "ring-2 ring-[#B244FF]" : ""}
              `}
            >
              <p
                className={`text-sm font-semibold ${FOLLOWUP_STATUSES[status]}`}
              >
                {status}
              </p>
              <p className="text-xs text-white/40 mt-1">
                Status setzen
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 INLINE PANEL – 1:1 WIE APPLICATION */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${showInlineDetails ? "max-h-[900px] mt-6" : "max-h-0"}
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
                  {
                    label: "Vorstellungsgespräch",
                    value: "Vorstellungsgespräch",
                  },
                  {
                    label: "Verkaufsgespräch",
                    value: "Verkaufsgespräch",
                  },
                  {
                    label: "Veranstaltung",
                    value: "Veranstaltung",
                  },
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

              {/* 📍 Ort */}
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
                        onChange={() =>
                          setLocationType(opt.key as any)
                        }
                        className="accent-[#B244FF]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={
                    locationType === "online"
                      ? "z. B. Google-Meet-Link"
                      : "Adresse / Ort eingeben"
                  }
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
              onClick={() => updateFollowUpStatus(selectedStatus)}
            >
              Speichern
            </OrbitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
