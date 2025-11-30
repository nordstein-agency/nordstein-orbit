"use client";

import { useState } from "react";
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

  async function handleClick() {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <AllianceButton
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Wird erstellt..." : "Mail Vorlage"}
    </AllianceButton>
  );
}
