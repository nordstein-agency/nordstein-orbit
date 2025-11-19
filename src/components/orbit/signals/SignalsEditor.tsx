"use client";

import OrbitTextarea from "@/components/orbit/OrbitTextarea";

interface SignalItem {
  value: boolean;
  notes: string;
}

type Signals = Record<string, SignalItem>;

interface SignalsEditorProps {
  value: Signals;
  onChange: (value: Signals) => void;
}

const ITEMS = [
  { key: "auffindbarkeit", label: "Auffindbarkeit (Google/Maps)" },
  { key: "social_media", label: "Social-Media-Profile" },
  { key: "content_qualitaet", label: "Content-Qualität" },
  { key: "website", label: "Website funktionsfähig" },
  { key: "tracking", label: "Tracking implementiert" },
  { key: "funnel", label: "Verkaufsfunnel vorhanden" },
  { key: "kaufbereitschaft", label: "Kaufbereitschafts-Signale" },
  { key: "agenturbindung", label: "Bestehende Agenturbindung" },
  { key: "entscheider", label: "Entscheider erreichbar" },
  { key: "budget", label: "Budgetindikator" },
];

export default function SignalsEditor({ value, onChange }: SignalsEditorProps) {
  const signals = value ?? {};

  function update(key: string, updateValue: Partial<SignalItem>) {
    onChange({
      ...signals,
      [key]: {
        ...(signals[key] ?? { value: false, notes: "" }),
        ...updateValue,
      },
    });
  }

  return (
    <div className="space-y-10">
      {ITEMS.map(({ key, label }) => {
        const item = signals[key] ?? { value: false, notes: "" };

        return (
          <div
            key={key}
            className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-4"
          >
            <div className="flex justify-between items-center">
              <p className="text-white text-lg">{label}</p>

              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="radio"
                    checked={item.value === true}
                    onChange={() => update(key, { value: true })}
                  />
                  Ja
                </label>

                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="radio"
                    checked={item.value === false}
                    onChange={() => update(key, { value: false })}
                  />
                  Nein
                </label>
              </div>
            </div>

            <OrbitTextarea
              label="Notizen & Bewertung"
              value={item.notes}
              onChange={(v: string) => update(key, { notes: v })}
              rows={4}
            />
          </div>
        );
      })}
    </div>
  );
}
