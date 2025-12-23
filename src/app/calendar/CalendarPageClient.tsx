// src/app/calendar/CalendarPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import OrbitCalendarHeader from "@/components/orbit/calendar/OrbitCalendarHeader";
import OrbitCalendarWeekView from "@/components/orbit/calendar/OrbitCalendarWeekView";
import OrbitEventModal from "@/components/orbit/calendar/OrbitEventModal";
import { startOfWeek, addDays, format } from "date-fns";
import type { OrbitEventData } from "@/components/orbit/calendar/OrbitCalendarEvent";
import { resolveDisplayTZ } from "@/lib/orbit/timezone";
import { formatOrbit } from "@/lib/orbit/timezone";
import OrbitEventGroupModal from "@/components/orbit/calendar/OrbitEventGroupModal";



interface CalendarPageClientProps {
  // diese Props brauchst du NICHT mehr zwingend,
  // weil wir alles im Client per weekOffset berechnen.
  // Aber wenn page.tsx sie noch schickt: ignorieren ok.
}


export default function CalendarPageClient({}: CalendarPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
const [groupEvents, setGroupEvents] = useState<OrbitEventData[]>([]);


  const [eventsByDay, setEventsByDay] = useState<Record<string, OrbitEventData[]>>(
    {}
  );

  const [selectedEvent, setSelectedEvent] = useState<OrbitEventData | null>(null);
  const [createDefaults, setCreateDefaults] = useState<{ date: string; start: string } | null>(null);


  const [displayTimezoneSetting, setDisplayTimezoneSetting] =
  useState<string | null>(null);
// null = Business
// 'local' = Browser


const displayTZ = useMemo(
  () => resolveDisplayTZ(displayTimezoneSetting),
  [displayTimezoneSetting]
);

  // Stunden
  const hourStart = 7;
  const hourEnd = 22;
  const hours = useMemo(
    () =>
      Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i),
    []
  );

  // Woche (berechnet aus weekOffset)
  const today = new Date();
  const weekStart = useMemo(() => {
    const base = addDays(today, weekOffset * 7);
    return startOfWeek(base, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDays = useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Woche laden
  const loadWeek = async () => {
    const res = await fetch(`/api/orbit/get/calendar/week?offset=${weekOffset}`, {
      cache: "no-store",
    });

    if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error("Week API failed", {
    status: res.status,
    statusText: res.statusText,
    url: res.url,
    redirected: res.redirected,
    contentType: res.headers.get("content-type"),
    bodyPreview: text.slice(0, 300),
  });

  setEventsByDay({});
  return;
}


    const data = await res.json();
    const events = (data.events ?? []) as OrbitEventData[];

    const map: Record<string, OrbitEventData[]> = {};
    events.forEach((e) => {
const key = formatOrbit(e.starts_at, displayTZ, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });

    setEventsByDay(map);
  };

  useEffect(() => {
    loadWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset , displayTZ]);

  return (
    <main
      className="
        pt-20 
        px-6 
        min-h-screen 
        text-white
        bg-gradient-to-br from-[#120914] via-[#0b0710] to-[#050013]
      "
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <OrbitCalendarHeader
          weekStart={weekStart}
          onPrev={() => setWeekOffset((v) => v - 1)}
          onNext={() => setWeekOffset((v) => v + 1)}
          onToday={() => setWeekOffset(0)}
          displayTimezoneSetting={displayTimezoneSetting}
          onChangeDisplayTimezone={setDisplayTimezoneSetting}
        />


        <div
          className="
            rounded-3xl 
            border border-white/10 
            bg-black/40 
            backdrop-blur-2xl 
            shadow-[0_0_40px_rgba(150,75,255,0.25)]
            overflow-hidden
          "
        >
          <OrbitCalendarWeekView
            weekDays={weekDays}
            hours={hours}
            eventsByDay={eventsByDay}
            displayTZ={displayTZ}
            onSelectEvent={(ev: any) => {
              if (ev.__group) {
                setGroupEvents(ev.__group);
                setGroupModalOpen(true);
                return;
              }

              setSelectedEvent(ev);
              setModalOpen(true);
            }}
            onCreateEvent={(defaults) => {
              setSelectedEvent(null);      // Create-Mode
              setCreateDefaults(defaults); // Datum + Startzeit aus Doppelklick
              setModalOpen(true);
            }}
          />


        </div>
      </div>

      <OrbitEventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
          setCreateDefaults(null);
        }}
        event={selectedEvent}
        createDefaults={createDefaults}
        onSaved={() => loadWeek()}
        onDeleted={() => loadWeek()}
      />


      <OrbitEventGroupModal
        open={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false);
          setGroupEvents([]);
        }}
        events={groupEvents}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setModalOpen(true);
        }}
      />


      <button
        onClick={() => {
          setSelectedEvent(null); // ✅ Create-Mode
          setModalOpen(true);
        }}
        className="
          fixed bottom-10 right-10
          px-6 py-3 rounded-full
          bg-gradient-to-r from-[#d8a5d0] to-[#ad6ac3]
          text-black font-bold
          shadow-[0_0_25px_#d8a5d077]
          hover:shadow-[0_0_35px_#d8a5d099]
          hover:scale-105
          transition-all duration-200
        "
      >
        + Termin
      </button>
    </main>
  );
}
