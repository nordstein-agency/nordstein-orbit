// app/orbit/calendar/page.tsx

import { createServerSupabase } from "@/lib/supabase/server";
import { startOfWeek, addDays, format } from "date-fns";
import CalendarPageClient from "./CalendarPageClient";
import { OrbitEventData } from "@/components/orbit/calendar/OrbitCalendarEvent";

export default async function CalendarPage() {
  const supabase = await createServerSupabase();

  // --- DATE LOGIC ---
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const hourStart = 7;
  const hourEnd = 22;
  const hours = Array.from(
    { length: hourEnd - hourStart + 1 },
    (_, i) => hourStart + i
  );

  // --- LOAD EVENTS ---
  const { data: events } = await supabase
    .from("orbit_calendar_events")
    .select("*")
    .gte("starts_at", weekStart.toISOString())
    .lte("starts_at", addDays(weekStart, 7).toISOString());

  const typedEvents = (events || []) as OrbitEventData[];

  const eventsByDay: Record<string, OrbitEventData[]> = {};
  typedEvents.forEach((e) => {
    const key = format(new Date(e.starts_at), "yyyy-MM-dd");
    if (!eventsByDay[key]) eventsByDay[key] = [];
    eventsByDay[key].push(e);
  });

  return (
    <CalendarPageClient
      weekStart={weekStart}
      weekDays={weekDays}
      hours={hours}
      eventsByDay={eventsByDay}
    />
  );
}
