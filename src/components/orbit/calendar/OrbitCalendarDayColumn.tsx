import { differenceInMinutes, format } from "date-fns";
import { formatOrbit } from "@/lib/orbit/timezone";
import OrbitCalendarEvent, { OrbitEventData } from "./OrbitCalendarEvent";

interface OrbitCalendarDayColumnProps {
  day: Date;
  events: OrbitEventData[];
  hourStart: number;
  rowHeight: number;
  displayTZ: string;
  onSelectEvent?: (event: OrbitEventData) => void;
  onCreateEvent?: (defaults: { date: string; start: string }) => void;

}


function calculateHeatmap(
  events: OrbitEventData[],
  hourStart: number,
  slots = 16 // 7–22 Uhr = 16 Slots
) {
  const heat: number[] = Array(slots).fill(0);

  events.forEach((e) => {
    const start = new Date(e.starts_at);
    const end = new Date(e.ends_at);

    for (let i = 0; i < slots; i++) {
      const slotHour = hourStart + i;
      const slotStart = new Date(start);
      slotStart.setHours(slotHour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotHour + 1, 0, 0, 0);

      if (start < slotEnd && end > slotStart) {
        heat[i]++;
      }
    }
  });

  return heat;
}

/**
 * Gruppiert überlappende Events
 */
function groupOverlappingEvents(events: OrbitEventData[]) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  const groups: OrbitEventData[][] = [];

  sorted.forEach((event) => {
    const start = new Date(event.starts_at).getTime();
    const end = new Date(event.ends_at).getTime();

    let placed = false;

    for (const group of groups) {
      const overlaps = group.some((g) => {
        const gs = new Date(g.starts_at).getTime();
        const ge = new Date(g.ends_at).getTime();
        return start < ge && end > gs;
      });

      if (overlaps) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([event]);
    }
  });

  return groups;
}

export default function OrbitCalendarDayColumn({
  day,
  events,
  hourStart,
  rowHeight,
  displayTZ,
  onSelectEvent,
  onCreateEvent,
}: OrbitCalendarDayColumnProps) {



  const isToday =
    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // relative Y-Position innerhalb der Column
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Slot berechnen
    const minutesFromTop = Math.max(0, Math.round((y / rowHeight) * 60));
    const totalMinutes = hourStart * 60 + minutesFromTop;

    const h = Math.min(23, Math.floor(totalMinutes / 60));
    const m = Math.min(59, totalMinutes % 60);

    const pad2 = (n: number) => String(n).padStart(2, "0");

    const dateStr = format(day, "yyyy-MM-dd");
    const timeStr = `${pad2(h)}:${pad2(m)}`;

    onCreateEvent?.({ date: dateStr, start: timeStr });
  };


  const heatmap = calculateHeatmap(events, hourStart);
  const maxHeat = Math.max(...heatmap, 1);


  return (
    <div
      className={`
        flex-1 
        border-l border-white/10 
        relative
        ${isToday ? "bg-white/[0.04]" : "bg-black/20"}
      `}
      onDoubleClick={handleDoubleClick}
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

      {/* EVENTS */}
      {groupOverlappingEvents(events).map((group) => {
        // gemeinsame Zeitbasis (frühester Start, spätestes Ende)
        const startTimes = group.map((e) => new Date(e.starts_at));
        const endTimes = group.map((e) => new Date(e.ends_at));

        const start = new Date(
          Math.min(...startTimes.map((d) => d.getTime()))
        );
        const end = new Date(
          Math.max(...endTimes.map((d) => d.getTime()))
        );

        // Position
        const startHour =
          Number(formatOrbit(start, displayTZ, "H")) +
          Number(formatOrbit(start, displayTZ, "m")) / 60;

        const topPx = (startHour - hourStart) * rowHeight;

        const durationMin = Math.max(15, differenceInMinutes(end, start));
        const heightPx = Math.max(50, (durationMin / 60) * rowHeight);

        // 🟢 FALL 1: GENAU EIN TERMIN → wie bisher
        if (group.length === 1) {
          const event = group[0];

          return (
            <OrbitCalendarEvent
              key={event.id}
              event={event}
              top={topPx}
              height={heightPx}
              onSelect={onSelectEvent}
            />
          );
        }

        // 🔵 FALL 2: MEHRERE TERMINE → AGGREGIERTER BLOCK
        return (
          <div
            key={`group-${group[0].id}`}
            style={{
              top: topPx,
              height: heightPx,
            }}
            onClick={() => {
              onSelectEvent?.({
                ...group[0],
                __group: group, // Marker
              } as any);
            }}

            className="
              absolute left-1 right-1
              rounded-lg
              bg-[#d8a5d0]/20
              border border-[#d8a5d0]/40
              px-2 py-1
              text-xs
              cursor-pointer
              hover:bg-[#d8a5d0]/25
              transition
            "
          >
            <div className="font-semibold text-[#d8a5d0]">
              {group.length} Termine
            </div>
            <div className="text-[10px] text-gray-300">
              Klick für Details
            </div>
          </div>
        );
      })}
    </div>
  );
}
