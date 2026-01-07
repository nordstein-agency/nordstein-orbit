"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import OrbitButton from "@/components/orbit/OrbitButton";
import { usePathname, useRouter } from "next/navigation";
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

export default function ApplicationsPage() {
  const authClient = createSupabaseAuthClient();
  const router = useRouter();
  const pathname = usePathname();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<"created_at" | "name">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // --------------------------------
  // Load user + role + applications
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

      // Rolle laden
      const roleRes = await fetch(`/api/orbit/get/my-role?auth_id=${user.id}`, {
        cache: "no-store",
      });

      let role: string | null = null;

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        role = roleData?.role ?? null;
        setCurrentUserRole(role);
      }

      // Guard
      if (role !== "Geschäftsführung") {
        router.push("/leads");
        return;
      }

      // Applications laden
      const res = await fetch("/api/orbit/get/applications", {
        cache: "no-store",
      });

      if (!res.ok) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setApplications(data ?? []);
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTab =
    pathname === "/leads/upload"
      ? "import"
      : pathname === "/leads/applications"
      ? "applications"
      : "list";

  // ---------------------------
  // Helper: Alter berechnen
  // ---------------------------
  const calcAge = (birthYear: number | string | null) => {
  if (birthYear == null) return "—";

  const year = Number(birthYear);

  if (!Number.isFinite(year)) return "—";
  if (year < 1900 || year > new Date().getFullYear()) return "—";

  return new Date().getFullYear() - year;
};


  // ---------------------------
  // Filter + Sort
  // ---------------------------
  const processedApplications = useMemo(() => {
    let out = [...applications];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      out = out.filter((a) =>
        [a.name, a.location, a.email, a.phone, a.experience]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term))
      );
    }

    if (statusFilter) {
      out = out.filter((a) => (a.status ?? "Neu") === statusFilter);
    }

    out.sort((a, b) => {
      const A: any = a[sortField];
      const B: any = b[sortField];
      if (A == null) return 1;
      if (B == null) return -1;
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [applications, searchTerm, statusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(processedApplications.length / PAGE_SIZE);
  const paginatedApplications = processedApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortField, sortDir]);

  // ---------------------------
  return (
    <div className="px-6 pt-16 py-10 space-y-10 max-w-5xl mx-auto relative">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-3">
        <button
          className={`text-sm pb-2 transition ${
            activeTab === "list"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/leads")}
        >
          Aktive Leads
        </button>

        <button
          className={`text-sm pb-2 transition ${
            activeTab === "import"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/leads/upload")}
        >
          Lead-Import
        </button>

        {currentUserRole === "Geschäftsführung" && (
          <button
            className={`text-sm pb-2 transition ${
              activeTab === "applications"
                ? "text-white border-b-2 border-[#B244FF]"
                : "text-white/40 hover:text-white/80"
            }`}
            onClick={() => router.push("/leads/applications")}
          >
            Bewerbungen
          </button>
        )}
      </div>

      {/* Overview */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white text-lg font-semibold">Bewerbungen</p>
        <p className="text-white/50 text-sm">
          {processedApplications.length} gefiltert · {applications.length} insgesamt
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Suchen (Name, Ort, Kontakt, Erfahrung...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40"
        />

        <OrbitDropdown
          value={statusFilter}
          placeholder="Status"
          options={[
            { label: "Alle", value: "" },
            ...Array.from(
              new Set(applications.map((a) => a.status ?? "Neu"))
            ).map((s) => ({ label: s, value: s })),
          ]}
          onChange={setStatusFilter}
        />
      </div>

      {/* Sort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OrbitDropdown
          value={sortField}
          placeholder="Sortieren nach…"
          options={[
            { label: "Datum", value: "created_at" },
            { label: "Name", value: "name" },
          ]}
          onChange={(v) => setSortField(v as any)}
        />

        <OrbitDropdown
          value={sortDir}
          placeholder="Richtung"
          options={[
            { label: "Aufsteigend", value: "asc" },
            { label: "Absteigend", value: "desc" },
          ]}
          onChange={(v) => setSortDir(v as any)}
        />
      </div>

      {/* Table */}
      {!loading && paginatedApplications.length === 0 && (
        <div className="text-gray-500 border border-white/10 rounded-xl p-6">
          Keine Bewerbungen gefunden.
        </div>
      )}

      {!loading && paginatedApplications.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Alter</th>
                <th className="px-4 py-3 text-left">Ort</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {paginatedApplications.map((a) => (
                <tr
  key={a.id}
  onClick={() => router.push(`/leads/applications/${a.id}`)}
  className="hover:bg-white/10 transition cursor-pointer"
>

                  <td className="px-4 py-3 text-white">{a.name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {calcAge(a.birth_year)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {a.location || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-200 font-semibold">
                    {a.status ?? "Neu"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <OrbitButton disabled={page === 1} onClick={() => setPage(page - 1)}>
            ← Zurück
          </OrbitButton>

          <span className="text-white/60">
            Seite {page} / {totalPages}
          </span>

          <OrbitButton
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Weiter →
          </OrbitButton>
        </div>
      )}
    </div>
  );
}
