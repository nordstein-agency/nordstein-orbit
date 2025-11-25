// src/components/orbit/calendar/OrbitEventModal.tsx
"use client";

import { useState } from "react";
import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";
import OrbitButton from "@/components/orbit/OrbitButton";

interface OrbitEventModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OrbitEventModal({
  open,
  onClose,
}: OrbitEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    console.log("MOCK EVENT CREATE", { title, date, start, end, notes });
    onClose();
  };

  return (
    <OrbitModal open={open} onClose={onClose}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-1">
        Neuer Termin
      </p>
      <h1 className="text-xl font-bold mb-4">Analyse · Beratung · Terminplanung</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <OrbitInput
          placeholder="Titel"
          value={title}
          onChange={(v) => setTitle(v)}
        />
        <OrbitInput
          placeholder="Datum (z.B. 21.11.2025)"
          value={date}
          onChange={(v) => setDate(v)}
        />
        <OrbitInput
          placeholder="Start (z.B. 14:00)"
          value={start}
          onChange={(v) => setStart(v)}
        />
        <OrbitInput
          placeholder="Ende (z.B. 15:30)"
          value={end}
          onChange={(v) => setEnd(v)}
        />
      </div>

      <OrbitTextarea
        placeholder="Notizen zum Termin, Ziel, Kunde, Bewerber etc."
        value={notes}
        onChange={(v) => setNotes(v)}
      />

      <div className="flex justify-end mt-5 gap-2">
        <OrbitButton
          className="px-4 py-2 text-xs bg-white/5 border border-white/15 rounded-full hover:bg-white/10"
          onClick={onClose}
        >
          Abbrechen
        </OrbitButton>
        <OrbitButton
          className="px-5 py-2 text-xs bg-gradient-to-r from-[#d8a5d0] to-[#ad6ac3] text-black font-semibold rounded-full hover:shadow-[0_0_18px_#d8a5d077]"
          onClick={handleSave}
        >
          Speichern (Mock)
        </OrbitButton>
      </div>
    </OrbitModal>
  );
}
