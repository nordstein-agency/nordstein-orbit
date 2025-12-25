// src/app/calendar/CalendarPageClient.tsx
"use client";

import OrbitBlockLoader from "@/components/orbit/OrbitBlockLoader";
import { useEffect, useMemo, useState } from "react";
import OrbitCalendarHeader from "@/components/orbit/calendar/OrbitCalendarHeader";
import OrbitCalendarWeekView from "@/components/orbit/calendar/OrbitCalendarWeekView";
import OrbitEventModal from "@/components/orbit/calendar/OrbitEventModal";
import OrbitEventGroupModal from "@/components/orbit/calendar/OrbitEventGroupModal";
import OrbitCalendarDayStatsRow from "@/components/orbit/calendar/OrbitCalendarDayStatsRow";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";
import { startOfWeek, addDays } from "date-fns";
import type { OrbitEventData } from "@/components/orbit/calendar/OrbitCalendarEvent";
import { resolveDisplayTZ, formatOrbit } from "@/lib/orbit/timezone";
import OrbitDayStatsModal from "@/components/orbit/calendar/OrbitDayStatsModal";


interface CalendarPageClientProps {}

export default function CalendarPageClient({}: CalendarPageClientProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dayStatsModalOpen, setDayStatsModalOpen] = useState(false);
  const [selectedStatsDate, setSelectedStatsDate] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupEvents, setGroupEvents] = useState<OrbitEventData[]>([]);

  const [selectedStats, setSelectedStats] = useState<any | null>(null);


  const [eventsByDay, setEventsByDay] = useState<Record<string, OrbitEventData[]>>({});
  const [dayStatsByDay, setDayStatsByDay] = useState<Record<string, any[]>>({});

  const [selectedEvent, setSelectedEvent] = useState<OrbitEventData | null>(null);
  const [createDefaults, setCreateDefaults] =
    useState<{ date: string; start: string } | null>(null);

  const [displayTimezoneSetting, setDisplayTimezoneSetting] =
    useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [onlyOwn, setOnlyOwn] = useState(false);
  const [calendarUsers, setCalendarUsers] = useState<
    { label: string; value: string }[]
  >([]);

  const displayTZ = useMemo(
    () => resolveDisplayTZ(displayTimezoneSetting),
    [displayTimezoneSetting]
  );

  const hourStart = 7;
  const hourEnd = 22;
  const hours = useMemo(
    () => Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i),
    []
  );

  const today = new Date();
  const weekStart = useMemo(() => {
    const base = addDays(today, weekOffset * 7);
    return startOfWeek(base, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDays = useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const loadWeek = async () => {
    if (!selectedUserId) return;
    const params = new URLSearchParams({
      offset: String(weekOffset),
      user_id: selectedUserId,
      only_own: onlyOwn ? "1" : "0",
    });

    const res = await fetch(`/api/orbit/get/calendar/week?${params}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      setEventsByDay({});
      return;
    }

    const data = await res.json();
    const map: Record<string, OrbitEventData[]> = {};

    (data.events ?? []).forEach((e: OrbitEventData) => {
      const key = formatOrbit(e.starts_at, displayTZ, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });

    setEventsByDay(map);
  };

  const loadDayStats = async () => {
    if (!selectedUserId || !onlyOwn) return;
    const res = await fetch(`/api/orbit/get/day-stats/week?offset=${weekOffset}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const json = await res.json();
    setDayStatsByDay(json.statsByDay ?? {});
  };

  useEffect(() => {
    fetch("/api/orbit/get/users/for-calendar")
      .then((r) => r.json())
      .then((j) => {
        setCalendarUsers(j.users ?? []);
        if (!selectedUserId && j.users?.length) {
          setSelectedUserId(j.users[0].value);
        }
      });
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



  return (
    <main className="pt-20 px-6 min-h-screen text-white bg-gradient-to-br from-[#120914] via-[#0b0710] to-[#050013] mb-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <OrbitCalendarHeader
          weekStart={weekStart}
          onPrev={() => setWeekOffset((v) => v - 1)}
          onNext={() => setWeekOffset((v) => v + 1)}
          onToday={() => setWeekOffset(0)}
          displayTimezoneSetting={displayTimezoneSetting}
          onChangeDisplayTimezone={setDisplayTimezoneSetting}
        />

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

        <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden">
          
          {loading && <OrbitBlockLoader label="Kalender lädt…" />}

          
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
            onEventMoved={loadWeek}
          />

          {onlyOwn && (
            <OrbitCalendarDayStatsRow
              weekDays={weekDays}
              statsByDay={dayStatsByDay}
              onSelectDay={(date, stats) => {
                setSelectedStatsDate(date);
                setDayStatsModalOpen(true);
                setSelectedStats(stats ?? null);
              }}
            />
          )}
        </div>
      </div>

      <OrbitDayStatsModal
        open={dayStatsModalOpen}
        date={selectedStatsDate}
        initialValues={selectedStats ?? undefined}
        onClose={() => {
          setDayStatsModalOpen(false);
          setSelectedStatsDate(null);
        }}
        onSaved={loadDayStats}
      />

      <OrbitEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        createDefaults={createDefaults}
        onSaved={loadWeek}
        onDeleted={loadWeek}
      />

      <OrbitEventGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        events={groupEvents}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setModalOpen(true);
        }}
      />
    </main>
  );
}
