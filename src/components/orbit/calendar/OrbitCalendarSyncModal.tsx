"use client";

import { useEffect, useState } from "react";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrbitCalendarSyncModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadToken() {
      setLoading(true);

      const supabase = createSupabaseAuthClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/orbit/calendar/ics-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_user_id: user.id,
        }),
      });

      const json = await res.json();
      setIcsUrl(json.url);
      setLoading(false);
    }

    loadToken();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0B0F] border border-[#B244FF]/40 shadow-[0_0_30px_rgba(178,68,255,0.35)] p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">
          Kalender synchronisieren
        </h2>

        <p className="text-sm text-gray-300 mb-4">
          Dieser Kalender enthält <b>nur deine eigenen Termine</b> aus Orbit.
        </p>

        {loading && <p className="text-sm">Kalender wird vorbereitet…</p>}

        {icsUrl && (
          <>
            <div className="bg-black/50 rounded-lg p-3 text-xs break-all border border-white/10 mb-4">
              {icsUrl}
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(icsUrl)}
              className="w-full mb-3 px-4 py-2 rounded-lg bg-[#B244FF] text-black font-medium"
            >
              Link kopieren
            </button>

            <p className="text-xs text-gray-400">
              Apple Kalender → „Kalenderabonnement hinzufügen“ → Link einfügen
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-gray-400 hover:text-white"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
