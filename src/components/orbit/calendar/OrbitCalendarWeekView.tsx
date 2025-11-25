// src/components/orbit/calendar/OrbitCalendarWeekView.tsx

import { format } from "date-fns";
import { de } from "date-fns/locale/de";
import OrbitCalendarTimeColumn from "./OrbitCalendarTimeColumn";
import OrbitCalendarDayColumn from "./OrbitCalendarDayColumn";
import { OrbitEventData } from "./OrbitCalendarEvent";

interface OrbitCalendarWeekViewProps {
  weekDays: Date[];
  hours: number[];
  eventsByDay: Record<string, OrbitEventData[]>;
}

export default function OrbitCalendarWeekView({
  weekDays,
  hours,
  eventsByDay,
}: OrbitCalendarWeekViewProps) {
  const today = new Date();

  return (
    <div className="flex flex-col h-[75vh]">

      {/* HEADER (Fix: Höhe = 72px wie Body Rows) */}
      <div className="flex border-b border-white/10 bg-gradient-to-r from-[#1a0f17] via-black to-[#120912] h-[72px]">

        {/* Zeit-Spalte */}
        <div
          className="
            w-20 
            flex items-center justify-end 
            pr-3 
            text-[14px] font-semibold text-gray-300
            border-r border-white/10
          "
        >
          Zeit
        </div>

        {/* Tages-Spalten */}
        <div className="flex flex-1">
          {weekDays.map((day) => {
            const isToday =
              format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

            return (
              <div
                key={day.toISOString()}
                className="
                  flex-1 
                  flex flex-col items-center justify-center 
                  border-l border-white/10
                "
              >
                <span className="text-[11px] uppercase tracking-wide text-gray-400">
                  {format(day, "EEE", { locale: de })}
                </span>

                <span
                  className={`text-xl font-semibold ${
                    isToday ? "text-[#d8a5d0]" : "text-white"
                  }`}
                >
                  {format(day, "dd.")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-y-auto bg-black/30">

        {/* Zeit-Spalte */}
        <OrbitCalendarTimeColumn hours={hours} />

        {/* 7 Tages-Spalten */}
        <div className="flex flex-1">
          {weekDays.map((day) => (
            <OrbitCalendarDayColumn
              key={day.toISOString()}
              day={day}
              events={eventsByDay[format(day, "yyyy-MM-dd")] || []}
              hourStart={7}
              rowHeight={72}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
