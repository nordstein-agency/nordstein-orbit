"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";

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

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const authClient = createSupabaseAuthClient();
  const id = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Status handling
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Follow up fields
  const [appointmentType, setAppointmentType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpDuration, setFollowUpDuration] = useState("60");
  const [followUpNote, setFollowUpNote] = useState("");

  // --------------------------------
  // Helpers
  // --------------------------------
  const calcAge = (birthYear: number | null) => {
    if (!birthYear) return "—";
    return new Date().getFullYear() - birthYear;
  };

  // --------------------------------
  // Load role + application
  // --------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await authClient.auth.getUser();

      if (!user) {
        router.push("/leads");
        return;
      }

      // Role
      const roleRes = await fetch(`/api/orbit/get/my-role?auth_id=${user.id}`, {
        cache: "no-store",
      });

      let role: string | null = null;

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        role = roleData?.role ?? null;
        setCurrentUserRole(role);
      }

      if (role !== "Geschäftsführung") {
        router.push("/leads");
        return;
      }

      // Application
      const res = await fetch(`/api/orbit/get/applications/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        router.push("/leads/applications");
        return;
      }

      const data = await res.json();
      setApplication(data);
      setSelectedStatus(data?.status ?? "Neu");
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --------------------------------
  // Status click
  // --------------------------------
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);

    if (status !== "Kein Interesse") {
      setShowFollowUpModal(true);
    } else {
      updateStatus(status);
    }
  };

  // --------------------------------
  // Update status
  // --------------------------------
  const updateStatus = async (status: string) => {
    await fetch(`/api/orbit/update/application-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        follow_up: {
          appointmentType,
          followUpDate,
          followUpTime,
          followUpDuration,
          followUpNote,
        },
      }),
    });

    router.push("/leads/applications");
  };

  if (loading || !application) {
    return (
      <div className="px-6 pt-20 text-white/50">
        Lade Bewerbung…
      </div>
    );
  }

  // --------------------------------
  return (
    <div className="px-6 pt-16 pb-20 space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Bewerbung von {application.name}
        </h1>
        <p className="text-white/50">
          {calcAge(application.birth_year)} Jahre · {application.location || "—"}
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
          <p className="text-white/40 text-sm">E-Mail</p>
          <p className="text-white">{application.email || "—"}</p>

          <p className="text-white/40 text-sm mt-4">Telefon</p>
          <p className="text-white">{application.phone || "—"}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/40 text-sm mb-2">
            Erfahrung im Vertrieb
          </p>
          <p className="text-white whitespace-pre-line">
            {application.experience || "—"}
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div>
        <h2 className="text-lg text-white font-semibold mb-4">
          Status der Bewerbung
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Termin vereinbart",
            "Erreicht, nochmals kontaktieren",
            "Nicht erreicht",
            "Kein Interesse",
          ].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={`p-4 rounded-xl border text-sm text-center transition
                ${
                  selectedStatus === status
                    ? "border-[#B244FF] text-white bg-white/10"
                    : "border-white/10 text-white/60 hover:bg-white/5"
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Follow Up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
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
                <h3 className="text-white font-semibold">
                  Nächstes Follow Up
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

            <div className="flex justify-end gap-3 pt-4">
              <OrbitButton
                variant="secondary"
                onClick={() => setShowFollowUpModal(false)}
              >
                Abbrechen
              </OrbitButton>

              <OrbitButton
                onClick={() => updateStatus(selectedStatus!)}
              >
                Speichern
              </OrbitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
