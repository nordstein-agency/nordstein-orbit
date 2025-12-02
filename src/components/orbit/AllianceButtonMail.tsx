"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AllianceButton from "../alliance/AllianceButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AllianceButtonMailProps {
  companyName: string | null;
  signals: Record<string, any> | null;
  leadId: string | null;
  className?: string;
}

export default function AllianceButtonMail({
  companyName,
  signals,
  leadId,
  className,
}: AllianceButtonMailProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleClick() {
    try {
      setLoading(true);

      // 1️⃣ Make Webhook triggern
      await fetch(
        "https://hook.eu1.make.com/v8ecur28m33qx9xxuhjitw5a6xtjucfq",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: leadId ?? "",
            company_name: companyName ?? "",
            signals: signals ?? {},
          }),
        }
      );

      // 2️⃣ Polling (max 30 Sekunden)
      let tries = 0;
      const MAX_TRIES = 30;

      while (tries < MAX_TRIES) {
        await new Promise((r) => setTimeout(r, 2000));

        const { data, error } = await supabase
          .from("lead_mail_templates")
          .select("*")
          .eq("lead_id", String(leadId))
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          // Neue Vorlage vorhanden → Seite refreshen
          router.refresh();
          setLoading(false);
          return;
        }

        tries++;
      }

      // Falls timeout → einfach reload
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AllianceButton className={className} onClick={handleClick} disabled={loading}>
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Generiere…
        </div>
      ) : (
        "Mail Vorlage"
      )}
    </AllianceButton>
  );
}
