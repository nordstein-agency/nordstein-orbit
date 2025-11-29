"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AlliancePartner } from "@/types/alliance";

interface AllianceTableProps {
  partners: AlliancePartner[];
}

export default function AllianceTable({ partners }: AllianceTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // FILTER + SEARCH
  const filtered = useMemo(() => {
    return partners.filter((p: AlliancePartner) => {
      const matchSearch =
        p.user_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.partner_role?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : p.status === filter;

      return matchSearch && matchFilter;
    });
  }, [partners, search, filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* SEARCH BAR */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Suche nach Partner, User-ID oder Rolle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-[#2a1b29]/60 border border-[#3d2a3a] 
                     text-white placeholder-[#b8a4b5] focus:outline-none focus:ring-2 focus:ring-[#caa063]"
        />
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex space-x-3">
        {[
          { key: "all", label: "Alle" },
          { key: "active", label: "Aktiv" },
          { key: "paused", label: "Pausiert" },
          { key: "blocked", label: "Blockiert" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-4 py-2 rounded-lg border transition ${
              filter === btn.key
                ? "bg-gradient-to-br from-[#e4c46d] to-[#b88a2a] text-black font-semibold shadow-lg shadow-black/40"
                : "bg-[#2a1b29]/60 border-[#3a2238] text-white hover:bg-[#3a2238]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* LUXURY TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#3a2238]">
        <table className="w-full border-collapse text-left">
          
          <thead className="bg-[#2d1c2c] border-b border-[#3f2a3d]">
            <tr>
              <th className="px-6 py-4 text-[#e8d9bf] font-semibold">Partner-ID</th>
              <th className="px-6 py-4 text-[#e8d9bf] font-semibold">User</th>
              <th className="px-6 py-4 text-[#e8d9bf] font-semibold">Rolle</th>
              <th className="px-6 py-4 text-[#e8d9bf] font-semibold">Status</th>
              <th className="px-6 py-4 text-[#e8d9bf] font-semibold text-right">Aktion</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p: AlliancePartner) => (
              <tr
                key={p.id}
                className="border-b border-[#3f2a3d] hover:bg-[#3a2238]/40 transition"
              >
                <td className="px-6 py-4 text-[#d9cad7]">{p.id}</td>
                <td className="px-6 py-4 text-[#d9cad7]">{p.user_id}</td>
                <td className="px-6 py-4 text-[#d9cad7]">{p.partner_role}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === "active"
                        ? "bg-gradient-to-br from-[#e4c46d] to-[#b88a2a] text-black"
                        : p.status === "paused"
                          ? "bg-[#6e4f20]/50 text-[#e8d9bf]"
                          : "bg-[#442020] text-[#f0c0c0]"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/alliance/partner/${p.id}`}
                    className="px-4 py-2 bg-[#451a3d] hover:bg-[#5b2b52] rounded-lg 
                               text-white transition shadow-md"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[#a98da6] italic"
                >
                  Keine Partner gefunden …
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
