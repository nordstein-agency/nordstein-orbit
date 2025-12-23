"use client";

import { useEffect, useState } from "react";
import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitButton from "@/components/orbit/OrbitButton";
import OrbitInput from "@/components/orbit/OrbitInput";

interface Props {
  open: boolean;
  date: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const FIELDS = [
  { key: "vk", label: "Verkauf (VK)" },
  { key: "vg", label: "Vorstellungsgespräch (VG)" },
  { key: "ea", label: "Einarbeitung (EA)" },
  { key: "eg", label: "Entwicklungsgespräch (EG)" },
  { key: "sem", label: "Seminar (SEM)" },
  { key: "on", label: "Onboarding (ON)" },
  { key: "up", label: "Upsell (UP)" },
  { key: "pg", label: "Persönliches Gespräch (PG)" },
] as const;

export default function OrbitDayStatsModal({
  open,
  date,
  onClose,
  onSaved,
}: Props) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Reset bei Öffnen
  useEffect(() => {
    if (open) {
      setValues({});
    }
  }, [open]);

  if (!open || !date) return null;

  async function save() {
    setSaving(true);

    const res = await fetch("/api/orbit/upsert/day-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...values }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Fehler beim Speichern der Tageskontrolle");
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <OrbitModal open={open} onClose={onClose}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-1">
        Tageskontrolle
      </p>

      <h2 className="text-xl font-bold mb-4">
        Aktivitäten · {date}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <OrbitInput
            key={f.key}
            type="number"
            placeholder={f.label}
            value={String(values[f.key] ?? "")}
            onChange={(v) =>
              setValues((prev) => ({
                ...prev,
                [f.key]: Number(v || 0),
              }))
            }
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <OrbitButton
          className="px-4 py-2 text-xs bg-white/5 border border-white/15 rounded-full"
          onClick={onClose}
          disabled={saving}
        >
          Abbrechen
        </OrbitButton>

        <OrbitButton
          className="px-5 py-2 text-xs bg-gradient-to-r from-[#d8a5d0] to-[#ad6ac3] text-black font-semibold rounded-full"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Speichere…" : "Speichern"}
        </OrbitButton>
      </div>
    </OrbitModal>
  );
}
