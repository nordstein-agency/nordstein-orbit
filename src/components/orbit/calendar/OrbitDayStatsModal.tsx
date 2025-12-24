"use client";

import { useEffect, useState } from "react";
import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitButton from "@/components/orbit/OrbitButton";

interface Props {
  open: boolean;
  date: string | null;
  onClose: () => void;
  onSaved: () => void;
  initialValues?: Record<string, number | null>;
}

const ACTIVITY_FIELDS = ["vk", "vg", "ea", "eg", "sem", "on", "up", "pg"] as const;
const RESULT_FIELDS = ["abs", "eh"] as const;

export default function OrbitDayStatsModal({
  open,
  date,
  onClose,
  onSaved,
  initialValues,
}: Props) {
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [saving, setSaving] = useState(false);

  // ✅ PREFILL bestehende Werte
  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      const clean: Record<string, number | undefined> = {};
      Object.entries(initialValues).forEach(([k, v]) => {
        if (typeof v === "number") clean[k] = v;
      });
      setValues(clean);
    } else {
      setValues({});
    }
  }, [open, initialValues]);

  if (!open || !date) return null;

  async function save() {
    setSaving(true);

    await fetch("/api/orbit/upsert/day-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...values }),
    });

    setSaving(false);
    onSaved();
    onClose();
  }

  function renderField(label: string) {
    return (
      <div key={label}>
        <label className="text-[11px] uppercase tracking-wide text-gray-400">
          {label}
        </label>
        <input
          type="number"
          className="
            mt-1 w-full
            bg-black/40
            border border-white/10
            rounded-xl
            px-4 py-2
            text-white
            focus:outline-none
            focus:border-[#d8a5d0]/40
          "
          value={values[label] ?? ""}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              [label]:
                e.target.value === "" ? undefined : Number(e.target.value),
            }))
          }
        />
      </div>
    );
  }

  return (
    <OrbitModal open={open} onClose={onClose}>
      <div
        className="
          w-full
          max-w-3xl
          max-h-[80vh]
          flex flex-col
        "
      >
        {/* ---------- HEADER ---------- */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase">
            Tageskontrolle
          </p>
          <h2 className="text-xl font-bold">{date}</h2>
        </div>

        {/* ---------- CONTENT ---------- */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-10">
            {/* LEFT */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Aktivitäten
              </p>
              {ACTIVITY_FIELDS.map(renderField)}
            </div>

            {/* RIGHT */}
            <div className="space-y-3 border-l border-white/10 pl-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Ergebnisse
              </p>
              {RESULT_FIELDS.map(renderField)}
            </div>
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div
          className="
            pt-4 mt-4
            border-t border-white/10
            flex justify-end gap-3
          "
        >
          <OrbitButton
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Abbrechen
          </OrbitButton>

          <OrbitButton onClick={save} disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </OrbitButton>
        </div>
      </div>
    </OrbitModal>
  );
}
