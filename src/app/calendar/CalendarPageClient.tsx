"use client";

import { useEffect, useMemo, useState } from "react";
import OrbitCalendarHeader from "@/components/orbit/calendar/OrbitCalendarHeader";
import OrbitCalendarWeekView from "@/components/orbit/calendar/OrbitCalendarWeekView";
import OrbitEventModal from "@/components/orbit/calendar/OrbitEventModal";
import { startOfWeek, addDays, set } from "date-fns";
import type { OrbitEventData } from "@/components/orbit/calendar/OrbitCalendarEvent";
import { resolveDisplayTZ } from "@/lib/orbit/timezone";
import { formatOrbit } from "@/lib/orbit/timezone";
import OrbitEventGroupModal from "@/components/orbit/calendar/OrbitEventGroupModal";
import OrbitCalendarDayStatsRow from "@/components/orbit/calendar/OrbitCalendarDayStatsRow";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { se } from "date-fns/locale";

interface CalendarPageClientProps {}

export default function CalendarPageClient({}: CalendarPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [loading, setLoading] = useState(true);


  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupEvents, setGroupEvents] = useState<OrbitEventData[]>([]);

  const [eventsByDay, setEventsByDay] = useState<Record<string, OrbitEventData[]>>(
    {}
  );

  const [dayStatsByDay, setDayStatsByDay] = useState<Record<string, any[]>>({});

  const [selectedEvent, setSelectedEvent] = useState<OrbitEventData | null>(null);
  const [createDefaults, setCreateDefaults] =
    useState<{ date: string; start: string } | null>(null);

  const [displayTimezoneSetting, setDisplayTimezoneSetting] =
    useState<string | null>(null);

  // 🔽 FILTER
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [onlyOwn, setOnlyOwn] = useState(false);
  const [calendarUsers, setCalendarUsers] = useState<
    { label: string; value: string }[]
  >([]);

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

  // Woche
  const today = new Date();
  const weekStart = useMemo(() => {
    const base = addDays(today, weekOffset * 7);
    return startOfWeek(base, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDays = useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // -----------------------------
  // Kalender laden (MIT FILTER)
  // -----------------------------
  const loadWeek = async () => {
    if (!selectedUserId) return;

    const params = new URLSearchParams({
      offset: String(weekOffset),
      user_id: selectedUserId,
      only_own: onlyOwn ? "1" : "0",
    });

    const res = await fetch(
      `/api/orbit/get/calendar/week?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      setEventsByDay({});
      setLoading(false);
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

  // -----------------------------
  // Tageskontrolle laden
  // -----------------------------
  const loadDayStats = async () => {
    if (!selectedUserId || !onlyOwn) return;

    const res = await fetch(
      `/api/orbit/get/day-stats/week?offset=${weekOffset}`,
      { cache: "no-store" }
    );
    if (!res.ok) return;

    const json = await res.json();
    setDayStatsByDay(json.statsByDay ?? {});
  };

  // -----------------------------
  // User für Dropdown laden
  // -----------------------------
  useEffect(() => {
    async function loadUsers() {
      const res = await fetch("/api/orbit/get/users/for-calendar");
      if (!res.ok) return;
      const json = await res.json();

      setCalendarUsers(json.users ?? []);

      if (!selectedUserId && json.users?.length) {
        setSelectedUserId(json.users[0].value); // default: ich
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
  async function loadAll() {
    if (!selectedUserId) return;

    setLoading(true);

    await loadWeek();
    await loadDayStats();

    setLoading(false);
  }

  loadAll();
}, [weekOffset, displayTZ, selectedUserId, onlyOwn]);


  if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1b0f1a] to-[#2a1527]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-28 h-28 border-4 border-white/10 border-t-[#B244FF] rounded-full animate-spin" />
        <img src="/loading.png" className="w-20 opacity-90" alt="logo" />
      </div>
      <p className="text-white/70 mt-6 text-lg tracking-wide">
        Lade Kalender…
      </p>
    </div>
  );
}

  return (

    <main
      className="
        pt-20 
        px-6 
        min-h-screen 
        text-white
        bg-gradient-to-br from-[#120914] via-[#0b0710] to-[#050013]
        mb-16
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

        {/* 🔽 FILTER UI */}
        <div className="flex items-center gap-4">
          <OrbitDropdown
            options={calendarUsers}
            value={selectedUserId ?? ""}
            onChange={(v) => {
              setSelectedUserId(v);
              setOnlyOwn(false);
            }}
            placeholder="Vertriebspartner wählen"
          />


          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={onlyOwn}
              onChange={(e) => setOnlyOwn(e.target.checked)}
            />
            Nur Eigene
          </label>
        </div>

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
              setSelectedEvent(null);
              setCreateDefaults(defaults);
              setModalOpen(true);
            }}
            onEventMoved={() => loadWeek()}
          />

          {/* 🔽 Tageskontrolle NUR bei "Nur Eigene" */}
          {onlyOwn && (
            <OrbitCalendarDayStatsRow
              weekDays={weekDays}
              statsByDay={dayStatsByDay}
            />
          )}
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
          setSelectedEvent(null);
          setCreateDefaults(null);
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
