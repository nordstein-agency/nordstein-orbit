// src/app/leads/applications/%5Bid%5D/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";

type Application = {
  id: string;
  created_at: string;
  name: string;
  birth_year: number | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  experience: string | null;
  status: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  Neu: "text-white/70",
  "Termin vereinbart": "text-green-400",
  "Erreicht, nochmals kontaktieren": "text-yellow-400",
  "Nicht erreicht": "text-blue-400",
  "Kein Interesse": "text-red-400",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>("Neu");
  const [showInlineDetails, setShowInlineDetails] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);


  // Follow-Up / Termin
  const [appointmentType, setAppointmentType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpDuration, setFollowUpDuration] = useState("60");
  const [followUpNote, setFollowUpNote] = useState("");

  const [history, setHistory] = useState<any[]>([]);


  // 📍 Ort des Termins
  const [locationType, setLocationType] = useState<
    "office" | "online" | "other" | ""
  >("");
  const [locationValue, setLocationValue] = useState("");

  const calcAge = (birthYear: number | null) =>
    birthYear ? new Date().getFullYear() - birthYear : "—";







  useEffect(() => {
  async function load() {
    setLoading(true);

    // 1️⃣ Auth-User holen
    const {
      data: { user },
    } = await createSupabaseAuthClient().auth.getUser();

    if (!user) {
      router.push("/leads");
      return;
    }

    // 2️⃣ users.id über auth_id holen
    const resUser = await fetch(
      `/api/orbit/get/user-by-auth-id?auth_id=${user.id}`,
      { cache: "no-store" }
    );

    if (!resUser.ok) {
      console.error("User lookup failed");
      return;
    }

    const userData = await resUser.json();
    setUserId(userData.id); // ✅ DAS ist die user_id

    // 3️⃣ Bewerbung laden
    const res = await fetch(`/api/orbit/get/applications/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      router.push("/leads/applications");
      return;
    }

    const r = await fetch(
  `/api/orbit/get/communication-history?source=application&source_id=${id}`,
  { cache: "no-store" }
);
if (r.ok) setHistory(await r.json());


    const data = await res.json();
    setApplication(data);
    setSelectedStatus(data?.status ?? "Neu");
    setLoading(false);
  }

  load();
}, [id, router]);






  // ---------------------------
  // Status click
  // ---------------------------
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);

    if (status === "Neu" || status === "Kein Interesse") {
      updateStatus(status);
      setShowInlineDetails(false);
      return;
    }

    setShowInlineDetails(true);
  };



  const updateStatus = async (status: string) => {
  if (!userId) {
    alert("User wird noch geladen – bitte 1 Sekunde warten");
    return;
  }

  const res = await fetch(`/api/orbit/update/application-status`, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        user_id: userId, 
        follow_up: {
          appointmentType,
          followUpDate,
          followUpTime,
          followUpDuration,
          followUpNote,
          locationType,
          locationValue,
        },
      }),
    });


// 👇 HIER IST DER ENTSCHEIDENDE TEIL
const text = await res.text();
console.log("RAW RESPONSE:", text);

let json: any = null;
try {
  json = JSON.parse(text);
} catch {}

if (!res.ok) {
  alert("API ERROR:\n" + (json?.error ?? text));
  return;
}


    router.push("/leads/applications");
  };

  



  if (loading || !application) {
    return <div className="px-6 pt-20 text-white/50">Lade Bewerbung…</div>;
  }

  return (
    <div className="px-6 pt-16 pb-20 space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Bewerbung von {application.name}
        </h1>
        <p className="text-white/50">
          {calcAge(application.birth_year)} Jahre ·{" "}
          {application.location || "—"}
        </p>
      </div>

      {/* Bewerbungsdetails */}
<div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
  <p className="text-xs uppercase tracking-widest text-white/40">
    Bewerbungsdetails
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
    {application.email && (
      <div>
        <p className="text-white/40">E-Mail</p>
        <p>{application.email}</p>
      </div>
    )}

    {application.phone && (
      <div>
        <p className="text-white/40">Telefon</p>
        <p>{application.phone}</p>
      </div>
    )}

    {application.experience && (
      <div className="md:col-span-2">
        <p className="text-white/40">Erfahrung</p>
        <p className="whitespace-pre-line">
          {application.experience}
        </p>
      </div>
    )}

    {application.created_at && (
      <div>
        <p className="text-white/40">Eingegangen am</p>
        <p>
          {new Date(application.created_at).toLocaleDateString(
            "de-AT"
          )}
        </p>
      </div>
    )}
  </div>
</div>


{/* Kommunikationshistorie */}
<div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
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


      {/* Status Cards */}
      <div>
        <h2 className="text-lg text-white font-semibold mb-4">
          Status der Bewerbung
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(STATUS_STYLES).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`
                p-5 rounded-xl border border-white/10 bg-white/5
                text-left transition hover:bg-white/10
                ${selectedStatus === status ? "ring-2 ring-[#B244FF]" : ""}
              `}
            >
              <p className={`text-sm font-semibold ${STATUS_STYLES[status]}`}>
                {status}
              </p>
              <p className="text-xs text-white/40 mt-1">Status setzen</p>
            </button>
          ))}
        </div>

        {/* Inline Detail Panel */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${showInlineDetails ? "max-h-[800px] opacity-100 mt-6" : "max-h-0 opacity-0"}
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

                {/* 📍 Ort des Termins */}
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
  disabled={!userId}
  onClick={() => updateStatus(selectedStatus)}  
>
  Speichern
</OrbitButton>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
