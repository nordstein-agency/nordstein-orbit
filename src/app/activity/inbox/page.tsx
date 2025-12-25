"use client";

import { useEffect, useState } from "react";
import OrbitButton from "@/components/orbit/OrbitButton";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import OrbitBlockLoader from "@/components/orbit/OrbitBlockLoader";
import OrbitPageLoader from "@/components/orbit/OrbitPageLoader";

type InboxItem = {
  id: string;
  created_at: string;
  title: string | null;
  message: string | null;
  sender_name: string | null;
};

export default function ActivityInboxPage() {
  const supabase = createSupabaseAuthClient();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filtered, setFiltered] = useState<InboxItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InboxItem | null>(null);

  

  // --------------------------------------------------
  // Load Inbox
  // --------------------------------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        // --------------------------------------------------
        // 1️⃣ Auth User holen (Supabase Auth)
        // --------------------------------------------------
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const authId = user.id;

        // --------------------------------------------------
        // 2️⃣ auth_id → echte users.id auflösen (Orbit API)
        // --------------------------------------------------
        const mapRes = await fetch(
          `/api/orbit/get/user-by-auth-id?auth_id=${authId}`
        );

        if (!mapRes.ok) {
          console.error("User mapping failed");
          setLoading(false);
          return;
        }

        const { id: userId } = await mapRes.json();

        // --------------------------------------------------
        // 3️⃣ Notifications aus One laden
        // --------------------------------------------------
        const res = await fetch("/api/one/read/notifications", {
          headers: {
            "x-user-id": userId,
          },
        });

        if (!res.ok) {
          console.error("Failed to load notifications");
          setItems([]);
          setFiltered([]);
          setLoading(false);
          return;
        }

        const json = await res.json();
        const list: InboxItem[] = json.data || [];

        setItems(list);
        setFiltered(list);
      } catch (e) {
        console.error(e);
        setItems([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [supabase]);

  

  // --------------------------------------------------
  // Search Filter
  // --------------------------------------------------
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------


  if (loading) {
  return <OrbitPageLoader label="Nachrichten werden geladen…" />;
}

  return (

    
    <>
              
    
      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nachrichten durchsuchen …"
          className="w-full md:w-96 bg-black/30 border border-white/10 px-4 py-2 rounded-xl outline-none text-white placeholder-white/40"
        />
      </div>

      {/* Messages Table */}
      <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">      
        <table className="w-full text-sm">
            
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-6 py-3 text-left">Datum</th>
              <th className="px-6 py-3 text-left">Betreff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length > 0 ? (
              filtered.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    {new Date(n.created_at).toLocaleString("de-DE")}
                  </td>
                  <td className="px-6 py-4">
                    {n.title || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-10 text-center text-white/40"
                >
                  Keine Nachrichten vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="mt-10 bg-black/20 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Nachricht
          </h2>

          <p className="text-white/70 mb-2">
            <strong>Datum:</strong>{" "}
            {new Date(selected.created_at).toLocaleString("de-DE")}
          </p>

          <p className="text-white/70 mb-2">
            <strong>Absender:</strong>{" "}
            {selected.sender_name || "System"}
          </p>

          <p className="text-white/70 mb-4">
            <strong>Betreff:</strong> {selected.title}
          </p>

          <hr className="border-white/10 my-4" />

          <p className="whitespace-pre-line text-white">
            {selected.message}
          </p>

          <OrbitButton
            className="mt-6"
            onClick={() => setSelected(null)}
          >
            Schließen
          </OrbitButton>
        </div>
      )}
    </>
  );
}
