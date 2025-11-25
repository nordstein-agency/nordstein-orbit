// src/components/orbit/calendar/OrbitCalendarEvent.tsx
import { format } from "date-fns";

export interface OrbitEventData {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  type?: string;
  location?: string | null;
}

interface OrbitCalendarEventProps {
  event: OrbitEventData;
  top: number;
  height: number;
}

export default function OrbitCalendarEvent({
  event,
  top,
  height,
}: OrbitCalendarEventProps) {
  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);

  return (
    <div
      className="
        absolute left-1 right-1
        rounded-xl px-2.5 py-1.5 text-[11px]
        bg-gradient-to-r from-[#d8a5d0dd] via-[#b873d2dd] to-[#7dd3fcdd]
        shadow-[0_0_18px_rgba(216,165,208,0.65)]
        text-black
        cursor-pointer
        transition-transform duration-150
        hover:-translate-y-0.5
      "
      style={{ top, height }}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="font-semibold truncate">{event.title}</span>
        {event.type && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/10">
            {event.type}
          </span>
        )}
      </div>
      <div className="text-[10px] opacity-80 flex items-center justify-between gap-2">
        <span>
          {format(start, "HH:mm")} – {format(end, "HH:mm")}
        </span>
        {event.location && (
          <span className="truncate max-w-[80px] text-right">
            {event.location}
          </span>
        )}
      </div>
    </div>
  );
}
