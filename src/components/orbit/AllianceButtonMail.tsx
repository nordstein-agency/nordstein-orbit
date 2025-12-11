"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AllianceButton from "../alliance/AllianceButton";

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

  async function handleClick() {
    try {
      setLoading(true);

      console.log("Lead ID:", leadId, "Company Name:", companyName, "Signals:", signals);

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

      // 2️⃣ Polling über API (nicht Browser Supabase!)
      let tries = 0;
      const MAX_TRIES = 30;

      while (tries < MAX_TRIES) {
        await new Promise((r) => setTimeout(r, 2000));

        const res = await fetch(`/api/orbit/get/lead-mail-template/${leadId}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();

          if (data) {
            router.refresh();
            setLoading(false);
            return;
          }
        }

        tries++;
      }

      // Timeout → Reload
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
