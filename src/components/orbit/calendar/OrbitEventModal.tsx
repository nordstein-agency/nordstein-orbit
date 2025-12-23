// src/components/orbit/calendar/OrbitEventModal.tsx
"use client";

import { useEffect, useState } from "react";
import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitInput from "@/components/orbit/OrbitInput";
import OrbitTextarea from "@/components/orbit/OrbitTextarea";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { createSupabaseAuthClient } from "@/lib/supabase/authClient";
import type { OrbitEventData } from "@/components/orbit/calendar/OrbitCalendarEvent";
import { businessLocalToUtc } from "@/lib/orbit/timezone";
import { formatOrbit } from "@/lib/orbit/timezone";


interface OrbitEventModalProps {
  open: boolean;
  onClose: () => void;
  event?: OrbitEventData | null;
  createDefaults?: { date: string; start: string } | null;
  onSaved?: () => void;
  onDeleted?: () => void;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(iso: string) {
  return formatOrbit(iso, "Europe/Vienna", "yyyy-MM-dd");
}

function toTimeInputValue(iso: string) {
  return formatOrbit(iso, "Europe/Vienna", "HH:mm");
}


/* ---------------------------------
   Terminarten (Label → Code)
---------------------------------- */
const EVENT_TYPES = [
  { label: "Vorstellungsgespräch", value: "VG" },
  { label: "Verkaufstermin", value: "VK" },
  { label: "Einarbeitung", value: "EA" },
  { label: "Entwicklungsgespräch", value: "EG" },
  { label: "Persönliches Gespräch", value: "PG" },
  { label: "Seminar", value: "SEM" },
  { label: "Onboarding", value: "ON" },
  { label: "Upsell Termin", value: "UP" },
];

export default function OrbitEventModal({
  open,
  onClose,
  event,
  onSaved,
  onDeleted,
  createDefaults,
}: OrbitEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");

  // Terminart
  const [eventType, setEventType] = useState<string>("VG");

  // Ort / Online
  const [mode, setMode] = useState<"personal" | "online">("personal");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [conflictCount, setConflictCount] = useState<number | null>(null);
  const [conflictChecked, setConflictChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const isEdit = !!event?.id;

  // -------------------------------
  // Prefill
  // -------------------------------
  useEffect(() => {
    if (!open) return;

    setConflictCount(null);
    setConflictChecked(false);

    if (event) {
      setTitle(event.title ?? "");
      setDate(toDateInputValue(event.starts_at));
      setStart(toTimeInputValue(event.starts_at));
      setEnd(toTimeInputValue(event.ends_at));
      setNotes((event as any)?.notes ?? "");

      setEventType((event as any)?.type ?? "VG");

      if ((event as any)?.meeting_link) {
        setMode("online");
        setMeetingLink((event as any)?.meeting_link ?? "");
        setLocation("");
      } else {
        setMode("personal");
        setLocation(event.location ?? "");
        setMeetingLink("");
      }
    } else {
      setTitle("");
      setNotes("");
      setEventType("VG");

      if (createDefaults) {
        // 📅 Datum & Start aus Doppelklick
        setDate(createDefaults.date);
        setStart(createDefaults.start);

        // ⏱️ Ende automatisch +60 Minuten
        const [h, m] = createDefaults.start.split(":").map(Number);
        const endMinutes = h * 60 + m + 60;
        const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
        const endM = String(endMinutes % 60).padStart(2, "0");

        setEnd(`${endH}:${endM}`);
      } else {
        // ➕ Button „+ Termin“ → leeres Modal
        setDate("");
        setStart("");
        setEnd("");
      }

      setMode("personal");
      setLocation("");
      setMeetingLink("");
    }

  }, [open, event, createDefaults]);

  // -------------------------------
  // Load user id
  // -------------------------------
  useEffect(() => {
    async function loadUserId() {
      const { data } = await createSupabaseAuthClient().auth.getUser();
      if (!data.user) return;

      const res = await fetch(
        `/api/orbit/get/user-by-auth-id?auth_id=${data.user.id}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;

      const json = await res.json();
      setUserId(json.id);
    }

    if (open) loadUserId();
  }, [open]);

  // -------------------------------
  // Conflict check
  // -------------------------------
  async function checkConflicts(starts_at: string, ends_at: string) {
    const res = await fetch("/api/orbit/calendar/check-conflicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        starts_at,
        ends_at,
        exclude_event_id: event?.id,
      }),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  }

  // -------------------------------
  // Save
  // -------------------------------
  const handleSave = async () => {
    if (!title || !date || !start || !end) {
      alert("Bitte Titel, Datum, Start und Ende ausfüllen.");
      return;
    }

    if (!isEdit && !userId) {
      alert("User-ID fehlt");
      return;
    }

    const starts_at = businessLocalToUtc(`${date} ${start}`).toISOString();
    const ends_at = businessLocalToUtc(`${date} ${end}`).toISOString();

    // ⚠️ Konflikte nur EINMAL prüfen
    if (!conflictChecked) {
      const conflicts = await checkConflicts(starts_at, ends_at);
      setConflictCount(conflicts);
      setConflictChecked(true);

      // ✅ KEINE Konflikte → direkt speichern
      if (conflicts === 0) {
        // einfach weiterlaufen lassen
      } else {
        // ❗ Konflikte vorhanden → Warnung anzeigen, Speichern abbrechen
        return;
      }
    }


    setSaving(true);

    const url = isEdit
      ? "/api/orbit/update/calendar/event"
      : "/api/orbit/create/calendar/event";

    const payload: any = isEdit
      ? {
          id: event!.id,
          title,
          starts_at,
          ends_at,
          type: eventType,
          location: mode === "personal" ? location || null : null,
          meeting_link: mode === "online" ? meetingLink || null : null,
          notes: notes || null,
        }
      : {
          user_id: userId,
          title,
          starts_at,
          ends_at,
          type: eventType,
          location: mode === "personal" ? location || null : null,
          meeting_link: mode === "online" ? meetingLink || null : null,
          notes: notes || null,
        };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "Fehler beim Speichern");
      return;
    }

    onSaved?.();
    onClose();
  };

  // -------------------------------
  // Delete
  // -------------------------------
  const handleDelete = async () => {
    if (!event?.id) return;
    if (!confirm("Termin wirklich löschen?")) return;

    setSaving(true);
    const res = await fetch("/api/orbit/delete/calendar/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });
    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "Fehler beim Löschen");
      return;
    }

    onDeleted?.();
    onClose();
  };

  return (
    <OrbitModal open={open} onClose={onClose}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-1">
        {isEdit ? "Termin bearbeiten" : "Neuer Termin"}
      </p>

      <h1 className="text-xl font-bold mb-4">
        Analyse · Beratung · Terminplanung
      </h1>

      {conflictCount !== null && conflictCount > 0 && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-400/30 text-yellow-200 text-xs">
          ⚠️ Dieser Termin überschneidet sich mit{" "}
          <span className="font-semibold">{conflictCount}</span>{" "}
          anderen Termin{conflictCount > 1 ? "en" : ""}. <br />
          <span className="opacity-80">
            Erneut auf „Speichern“ klicken, um trotzdem zu speichern.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <OrbitInput placeholder="Titel" value={title} onChange={setTitle} />

        <OrbitDropdown
          options={EVENT_TYPES}
          value={eventType}
          onChange={setEventType}
          placeholder="Terminart wählen"
        />

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white" />
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white" />
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white" />
      </div>

      {/* Modus */}
      <div className="flex gap-4 mb-3 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "personal"}
            onChange={() => setMode("personal")}
          />
          Persönlich
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "online"}
            onChange={() => setMode("online")}
          />
          Online
        </label>
      </div>

      {mode === "personal" && (
        <OrbitInput
          placeholder="Ort"
          value={location}
          onChange={setLocation}
        />
      )}

      {mode === "online" && (
        <OrbitInput
          placeholder="Meeting Link"
          value={meetingLink}
          onChange={setMeetingLink}
        />
      )}

      <OrbitTextarea
        placeholder="Notizen zum Termin, Ziel, Kunde, Bewerber etc."
        value={notes}
        onChange={setNotes}
      />

      <div className="flex justify-end mt-5 gap-2">
        {isEdit && (
          <OrbitButton className="px-4 py-2 text-xs bg-red-500/20 border border-red-400/30 text-red-200 rounded-full hover:bg-red-500/25" onClick={handleDelete} disabled={saving}>
            Löschen
          </OrbitButton>
        )}

        <OrbitButton className="px-4 py-2 text-xs bg-white/5 border border-white/15 rounded-full hover:bg-white/10" onClick={onClose} disabled={saving}>
          Abbrechen
        </OrbitButton>

        <OrbitButton className="px-5 py-2 text-xs bg-gradient-to-r from-[#d8a5d0] to-[#ad6ac3] text-black font-semibold rounded-full hover:shadow-[0_0_18px_#d8a5d077]" onClick={handleSave} disabled={saving}>
          {saving ? "Speichere…" : "Speichern"}
        </OrbitButton>
      </div>
    </OrbitModal>
  );
}
