// src/components/orbit/calendar/OrbitCalendarDayColumn.tsx

import { differenceInMinutes, format } from "date-fns";
import OrbitCalendarEvent, { OrbitEventData } from "./OrbitCalendarEvent";

interface OrbitCalendarDayColumnProps {
  day: Date;
  events: OrbitEventData[];
  hourStart: number;
  rowHeight: number;
}

export default function OrbitCalendarDayColumn({
  day,
  events,
  hourStart,
  rowHeight,
}: OrbitCalendarDayColumnProps) {
  const isToday =
    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      className={`
        flex-1 
        border-l border-white/10 
        relative
        ${isToday ? "bg-white/[0.04]" : "bg-black/20"}
      `}
    >
      {/* Stundenraster */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="h-[72px] border-t border-white/[0.07] relative"
        >
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.04]" />
        </div>
      ))}

      {/* Events */}
      {events.map((event) => {
        const start = new Date(event.starts_at);
        const end = new Date(event.ends_at);

        const startHour = start.getHours() + start.getMinutes() / 60;
        const topPx = (startHour - hourStart) * rowHeight;

        const durationMin = Math.max(15, differenceInMinutes(end, start));
        const heightPx = Math.max(50, (durationMin / 60) * rowHeight);

        return (
          <OrbitCalendarEvent
            key={event.id}
            event={event}
            top={topPx}
            height={heightPx}
          />
        );
      })}
    </div>
  );
}
