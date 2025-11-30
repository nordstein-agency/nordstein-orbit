"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import OrbitButton from "@/components/orbit/OrbitButton";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";

type Lead = {
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
};

export default function LeadsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [onlyOwn, setOnlyOwn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // ---------------------------
  // Load User + Leads
  // ---------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLeads([]);
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);

      setLeads(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  const activeTab = pathname === "/leads/upload" ? "import" : "list";

  // -------------------------------------------------------
  // Filter + Search + Sort
  // -------------------------------------------------------
  const processedLeads = useMemo(() => {
    let out = [...leads];

    // Filter "Nur eigene"
    if (onlyOwn && currentUserId) {
      out = out.filter((l) => l.owner === currentUserId);
    }

    // Search
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      out = out.filter((l) =>
        [
          l.company_name,
          l.website,
          l.email,
          l.ceo,
          l.industry,
          l.region,
        ]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term))
      );
    }

    // Industry filter
    if (industryFilter) {
      out = out.filter((l) => l.industry === industryFilter);
    }

    // Region filter
    if (regionFilter) {
      out = out.filter((l) => l.region === regionFilter);
    }

    // Sorting
    out.sort((a: any, b: any) => {
      const A = a[sortField];
      const B = b[sortField];

      if (A == null) return 1;
      if (B == null) return -1;

      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [
    leads,
    onlyOwn,
    currentUserId,
    searchTerm,
    industryFilter,
    regionFilter,
    sortField,
    sortDir,
  ]);

  // -------------------------------------------------------
  // Pagination
  // -------------------------------------------------------
  const totalPages = Math.ceil(processedLeads.length / PAGE_SIZE);
  const paginatedLeads = processedLeads.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset page on filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, industryFilter, regionFilter, sortField, sortDir, onlyOwn]);

  // -------------------------------------------------------
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
      </div>

      {/* Overview */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-lg font-semibold">
              Deine Leads Übersicht
            </p>
            <p className="text-white/50 text-sm">
              {processedLeads.length} gefiltert · {leads.length} insgesamt
            </p>
          </div>

          <Link href="/leads/upload">
            <OrbitButton>Leads importieren</OrbitButton>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Suchen (Firma, Website, Branche, Region...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40"
        />

        {/* Industry */}
        <OrbitDropdown
          value={industryFilter}
          placeholder="Branche"
          options={[
            { label: "Alle Branchen", value: "" },
            ...Array.from(new Set(leads.map((l) => l.industry).filter(Boolean))).map(
              (i) => ({ label: i!, value: i! })
            ),
          ]}
          onChange={setIndustryFilter}
        />

        {/* Region */}
        <OrbitDropdown
          value={regionFilter}
          placeholder="Region"
          options={[
            { label: "Alle Regionen", value: "" },
            ...Array.from(new Set(leads.map((l) => l.region).filter(Boolean))).map(
              (r) => ({ label: r!, value: r! })
            ),
          ]}
          onChange={setRegionFilter}
        />
      </div>

      {/* Sort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OrbitDropdown
          value={sortField}
          placeholder="Sortieren nach…"
          options={[
            { label: "Datum", value: "created_at" },
            { label: "Firma", value: "company_name" },
            { label: "Score", value: "score" },
            { label: "Branche", value: "industry" },
            { label: "Region", value: "region" },
          ]}
          onChange={setSortField}
        />

        <OrbitDropdown
          value={sortDir}
          placeholder="Richtung"
          options={[
            { label: "Aufsteigend", value: "asc" },
            { label: "Absteigend", value: "desc" },
          ]}
          onChange={(v) => setSortDir(v as "asc" | "desc")}
        />
      </div>

      {/* Only own checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="onlyOwn"
          checked={onlyOwn}
          onChange={(e) => setOnlyOwn(e.target.checked)}
          className="w-4 h-4 accent-[#b244ff]"
        />
        <label htmlFor="onlyOwn" className="text-sm text-gray-300">
          Nur eigene Leads anzeigen
        </label>
      </div>

      {/* Table */}
      {!loading && paginatedLeads.length === 0 && (
        <div className="text-gray-500 border border-white/10 rounded-xl p-6">
          Keine Leads gefunden.
        </div>
      )}

      {!loading && paginatedLeads.length > 0 && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Unternehmen</th>
                <th className="px-4 py-3 text-left">Branche</th>
                <th className="px-4 py-3 text-left">Region</th>
                <th className="px-4 py-3 text-left">Score</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="hover:bg-white/10 transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-white">
                    {lead.company_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {lead.industry || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {lead.region || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-200 font-semibold">
                    {lead.score ?? "—"}
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

      {/* Floating Button */}
      <Link
        href="/leads/new"
        className="fixed bottom-8 right-8 bg-[#B244FF] hover:bg-[#9A32E8] text-white px-5 py-4 rounded-full shadow-xl transition"
      >
        <span className="font-semibold">+</span> Lead anlegen
      </Link>

      

    </div>
  );
}
