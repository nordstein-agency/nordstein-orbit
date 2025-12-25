// src/app/activity/followups/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { useRouter } from "next/navigation";


/* -------------------------------------------------
 Types
------------------------------------------------- */


type FollowUp = {
  id: string;
  date: string | null;
  note: string | null;
  done: boolean;
  user_id: string;
  user: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};



type EmployeeOption = {
  value: string;
  label: string;
};

export default function ActivityFollowUpsPage() {
  const supabase = createSupabaseAuthClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FollowUp[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});


  // Scope / Filter
  const [scopeMode, setScopeMode] = useState<"me" | "employee">("me");
  const [includeStructure, setIncludeStructure] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"applications" | "leads">(
  "applications"
);


  // Users
  const [authId, setAuthId] = useState<string | null>(null);
  const [myUserIds, setMyUserIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  /* -------------------------------------------------
     1️⃣ Load Auth User
  ------------------------------------------------- */
  useEffect(() => {
    async function loadAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) return;
      setAuthId(data.user.id);
    }
    loadAuth();
  }, [supabase]);

  /* -------------------------------------------------
     2️⃣ Load Employees (Orbit DB)
  ------------------------------------------------- */
  useEffect(() => {
    supabase
      .from("users")
      .select("id, first_name, last_name")
      .order("last_name")
      .then(({ data }) => {
        if (!data) return;
        setEmployees(
          data.map((u) => ({
            value: u.id,
            label: [u.first_name, u.last_name].filter(Boolean).join(" "),
          }))
        );
      });
  }, [supabase]);

  /* -------------------------------------------------
     3️⃣ Resolve effective user_ids (Downline)
  ------------------------------------------------- */
  useEffect(() => {
    if (!authId) return;

    async function resolveUsers() {
      setLoading(true);

      let baseAuthId = authId;

      if (scopeMode === "employee" && selectedEmployeeId) {
        const { data } = await supabase
          .from("users")
          .select("auth_id")
          .eq("id", selectedEmployeeId)
          .single();

        if (data?.auth_id) baseAuthId = data.auth_id;
      }

      if (!includeStructure) {
        const res = await fetch(
          `/api/orbit/get/user-by-auth-id?auth_id=${baseAuthId}`
        );
        const { id } = await res.json();
        setMyUserIds([id]);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/orbit/get/user-downline?auth_id=${baseAuthId}`
      );
      const json = await res.json();
      setMyUserIds(json.user_ids || []);
      setLoading(false);
    }

    resolveUsers();
  }, [authId, scopeMode, selectedEmployeeId, includeStructure, supabase]);

  /* -------------------------------------------------
     4️⃣ Load Follow Ups
  ------------------------------------------------- */
  useEffect(() => {
    if (myUserIds.length === 0) return;

    async function loadFollowUps() {
      setLoading(true);

      const res = await fetch(
        `/api/orbit/get/followups?user_ids=${myUserIds.join(",")}`
      );

      const json = await res.json();
      setItems(json.data || []);
      setLoading(false);
    }

    loadFollowUps();
  }, [myUserIds]);

  /* -------------------------------------------------
     Helpers
  ------------------------------------------------- */
  function parseISODate(date?: string | null) {
    if (!date) return null;

    const parts = date.split("-");
    if (parts.length !== 3) return null;

    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return null;

    return new Date(y, m - 1, d);
  }

  /* -------------------------------------------------
     UI
  ------------------------------------------------- */
  return (
    <>
      {/* FILTER PANEL – EXAKT WIE GEWÜNSCHT */}
      <div className="rounded-3xl border border-white/10 bg-black/35 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Scope */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <p className="text-xs uppercase text-white/45 mb-3">Scope</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setScopeMode("me")}
                className={`flex-1 px-3 py-2 rounded-full border ${
                  scopeMode === "me"
                    ? "bg-[#B244FF]/10 border-[#d8a5d0]/35 text-[#d8a5d0]"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                Ich
              </button>

              <button
                onClick={() => setScopeMode("employee")}
                className={`flex-1 px-3 py-2 rounded-full border ${
                  scopeMode === "employee"
                    ? "bg-[#B244FF]/10 border-[#d8a5d0]/35 text-[#d8a5d0]"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                Mitarbeiter
              </button>
            </div>

            {scopeMode === "employee" && (
              <OrbitDropdown
                value={selectedEmployeeId}
                onChange={(v) => setSelectedEmployeeId(String(v))}
                options={employees}
                placeholder="Mitarbeiter auswählen"
              />
            )}

            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-white/70">inkl. Struktur</span>
              <button
                onClick={() => setIncludeStructure((v) => !v)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  includeStructure
                    ? "bg-[#B244FF]/10 border-[#d8a5d0]/35 text-[#d8a5d0]"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                {includeStructure ? "Aktiv" : "Aus"}
              </button>
            </div>
          </div>

          {/* Art */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
        <p className="text-xs uppercase text-white/45 mb-3">Art</p>

        <OrbitDropdown
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as "applications" | "leads")}
            options={[
            { value: "applications", label: "Bewerbungen" },
            { value: "leads", label: "Leads" },
            ]}
        />
        </div>


          {/* Status */}
          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <p className="text-xs uppercase text-white/45 mb-3">Status</p>
            <p className="text-sm text-emerald-300">
              {loading ? "Lädt…" : "Daten aktuell"}
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-white/50">Follow Ups werden geladen …</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-white/40">Keine Follow Ups vorhanden</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-6 py-3 text-left">Fällig</th>
                <th className="px-6 py-3 text-left">Notiz</th>
                <th className="px-6 py-3 text-left">Betreuer</th>
                <th className="px-6 py-3 text-left">Status</th>
            </tr>

            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((f) => {
                const dueDate = parseISODate(f.date);
                const overdue =
                  !f.done && dueDate !== null && dueDate < new Date();

                return (
                  <tr
                key={f.id}
                onClick={() => router.push(`/activity/followups/${f.id}`)}
                className="
                    cursor-pointer
                    hover:bg-white/5
                    transition
                "
                >

                    <td className="px-6 py-4">
                      {dueDate ? dueDate.toLocaleDateString("de-DE") : "—"}
                    </td>
                    <td className="px-6 py-4">{f.note || "—"}</td>

                    <td className="px-6 py-4">
  {f.user
    ? `${f.user.first_name ?? ""} ${f.user.last_name ?? ""}`.trim()
    : "—"}
</td>


                    <td className="px-6 py-4">
                    {f.done ? (
                        <span className="text-green-400">Erledigt</span>
                    ) : overdue ? (
                        <span className="text-red-400">Überfällig</span>
                    ) : (
                        <span className="text-yellow-300">Offen</span>
                    )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
