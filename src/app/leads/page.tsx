"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";

export default function LeadsPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login"); // ← sofort redirect
      }
    });
  }, []);

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-xl font-semibold mb-4">Leads</h1>
      <p>Wird geladen…</p>
    </main>
  );
}
