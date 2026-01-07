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

  assigned_user?: {
    id: string;
    name: string;
  } | null;

  possible_assignees?: {
    id: string;
    name: string;
  }[];
};

const STATUS_STYLES: Record<string, string> = {
  Neu: "text-white/70",
  "Termin vereinbart": "text-green-400",
  "Erreicht, nochmals kontaktieren": "text-yellow-400",
  "Nicht erreicht": "text-blue-400",
  "Kein Interesse": "text-red-400",
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getNextQuarterTime = () => {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);
  return d.toTimeString().slice(0, 5);
};

export default function ApplicationDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("Neu");
  const [showInlineDetails, setShowInlineDetails] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [assigneeSaving, setAssigneeSaving] = useState(false);
  const [assigneeSaved, setAssigneeSaved] = useState(false);

  const [appointmentType, setAppointmentType] = useState("");
  const [followUpDate, setFollowUpDate] = useState(getTodayDate);
  const [followUpTime, setFollowUpTime] = useState(getNextQuarterTime);
  const [followUpDuration, setFollowUpDuration] = useState("60");
  const [followUpNote, setFollowUpNote] = useState("");

  const [history, setHistory] = useState<any[]>([]);

  const [locationType, setLocationType] =
    useState<"office" | "online" | "other" | "">("");
  const [locationValue, setLocationValue] = useState("");

  const [showAssigneeEdit, setShowAssigneeEdit] = useState(false);
  const [newAssignee, setNewAssignee] = useState("");

  const calcAge = (y: number | null) =>
    y ? new Date().getFullYear() - y : "—";

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await createSupabaseAuthClient().auth.getUser();

      if (!user) {
        router.push("/leads");
        return;
      }

      const u = await fetch(
        `/api/orbit/get/user-by-auth-id?auth_id=${user.id}`,
        { cache: "no-store" }
      );

      const ud = await u.json();
      setUserId(ud.id);

      const res = await fetch(
        `/api/orbit/get/applications/${id}?auth_id=${user.id}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        router.push("/leads/applications");
        return;
      }

      const data = await res.json();
      setApplication(data);
      setSelectedStatus(data.status ?? "Neu");

      const h = await fetch(
        `/api/orbit/get/communication-history?source=application&source_id=${id}`,
        { cache: "no-store" }
      );
      if (h.ok) setHistory(await h.json());

      setLoading(false);
    }

    load();
  }, [id, router]);

  const updateAssignee = async (newUserId: string) => {
    if (!userId || !application) return;

    setAssigneeSaving(true);
    setAssigneeSaved(false);

    const res = await fetch("/api/orbit/update/application-assignee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: id,
        new_user_id: newUserId,
        changed_by: userId,
      }),
    });

    setAssigneeSaving(false);

    if (!res.ok) {
      alert("Fehler beim Zuweisen");
      return;
    }

    const newAssigneeObj = application.possible_assignees?.find(
      (u) => u.id === newUserId
    );

    if (newAssigneeObj) {
      setApplication({
        ...application,
        assigned_user: {
          id: newAssigneeObj.id,
          name: newAssigneeObj.name,
        },
      });
    }

    setAssigneeSaved(true);
    setShowAssigneeEdit(false);
    setNewAssignee("");

    setTimeout(() => {
      router.refresh();
      setAssigneeSaved(false);
    }, 600);
  };

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
    if (!userId) return;

    const res = await fetch("/api/orbit/update/application-status", {
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

    if (!res.ok) {
      alert("Fehler beim Speichern");
      return;
    }

    router.push("/leads/applications");
  };

  if (loading || !application) {
    return <div className="px-6 pt-20 text-white/50">Lade Bewerbung…</div>;
  }

  return (
    <div className="px-6 pt-16 pb-20 space-y-10 max-w-4xl mx-auto">
      <OrbitButton
        variant="secondary"
        onClick={() => router.back()}
        className="w-fit"
      >
        ← Zurück
      </OrbitButton>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Bewerbung von {application.name}
        </h1>

        <p className="text-white/50">
          {calcAge(application.birth_year)} Jahre ·{" "}
          {application.location || "—"}
        </p>

        <div className="flex flex-col gap-1 text-sm text-white/70">
          {application.phone && (
            <a href={`tel:${application.phone}`} className="hover:text-white">
              📞 {application.phone}
            </a>
          )}

          {application.email && (
            <a
              href={`mailto:${application.email}`}
              className="hover:text-white"
            >
              ✉️ {application.email}
            </a>
          )}
        </div>

        <p className="text-sm text-white/60 mt-1">
          Zugewiesen an:{" "}
          <span className="text-white font-medium">
            {application.assigned_user?.name ?? "—"}
          </span>
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-white font-semibold">
          Betreuer: {application.assigned_user?.name ?? "—"}
        </h3>

        {!showAssigneeEdit ? (
          <OrbitButton
            variant="secondary"
            onClick={() => setShowAssigneeEdit(true)}
          >
            Betreuer ändern
          </OrbitButton>
        ) : (
          <>
            <OrbitDropdown
              value={newAssignee}
              placeholder="Neuen Betreuer wählen"
              options={
                application.possible_assignees?.map((u) => ({
                  label: u.name,
                  value: u.id,
                })) ?? []
              }
              onChange={setNewAssignee}
            />

            <div className="flex justify-end gap-3">
              {assigneeSaved && (
                <span className="text-sm text-green-400 mr-auto">
                  ✓ Betreuer wurde geändert
                </span>
              )}

              <OrbitButton
                variant="secondary"
                onClick={() => setShowAssigneeEdit(false)}
                disabled={assigneeSaving}
              >
                Abbrechen
              </OrbitButton>

              <OrbitButton
                disabled={!newAssignee || assigneeSaving}
                onClick={() => updateAssignee(newAssignee)}
              >
                {assigneeSaving ? "Speichern…" : "Speichern"}
              </OrbitButton>
            </div>
          </>
        )}
      </div>

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
              <p className="text-xs text-white/40 mt-1">
                Status setzen
              </p>
            </button>
          ))}
        </div>

        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${
              showInlineDetails
                ? "max-h-[800px] opacity-100 mt-6"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
            {selectedStatus === "Termin vereinbart" ? (
              <>
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
                    onChange={(e) =>
                      setFollowUpDate(e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                  />
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) =>
                      setFollowUpTime(e.target.value)
                    }
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
              </>
            ) : (
              <>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) =>
                    setFollowUpDate(e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                />

                <textarea
                  placeholder="Notiz"
                  value={followUpNote}
                  onChange={(e) =>
                    setFollowUpNote(e.target.value)
                  }
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
