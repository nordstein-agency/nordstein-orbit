"use client";

import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitEventData } from "./OrbitCalendarEvent";
import { formatOrbit, resolveDisplayTZ } from "@/lib/orbit/timezone";

interface OrbitEventGroupModalProps {
  open: boolean;
  onClose: () => void;
  events: OrbitEventData[];
  onSelectEvent: (event: OrbitEventData) => void;
}

export default function OrbitEventGroupModal({
  open,
  onClose,
  events,
  onSelectEvent,
}: OrbitEventGroupModalProps) {
  const tz = resolveDisplayTZ(null);

  return (
    <OrbitModal open={open} onClose={onClose}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-1">
        Überschneidende Termine
      </p>

      <h1 className="text-xl font-bold mb-4">
        {events.length} Termine zur selben Zeit
      </h1>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {events.map((event) => {
          const start = new Date(event.starts_at);
          const end = new Date(event.ends_at);

          return (
            <button
              key={event.id}
              onClick={() => {
                onClose();
                onSelectEvent(event);
              }}
              className="
                w-full text-left px-4 py-3 rounded-xl
                bg-black/40 border border-white/10
                hover:border-[#d8a5d0]/40 hover:bg-white/5
                transition
              "
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white truncate">
                  {event.title}
                </span>

                {event.type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                    {event.type}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-300 flex justify-between">
                <span>
                  {formatOrbit(start, tz, "HH:mm")} –{" "}
                  {formatOrbit(end, tz, "HH:mm")}
                </span>

                {event.location && (
                  <span className="truncate max-w-[140px] text-right">
                    {event.location}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-4">
        <OrbitButton
          className="px-4 py-2 text-xs bg-white/10 border border-white/20 rounded-full hover:bg-white/20"
          onClick={onClose}
        >
          Schließen
        </OrbitButton>
      </div>
    </OrbitModal>
  );
}
