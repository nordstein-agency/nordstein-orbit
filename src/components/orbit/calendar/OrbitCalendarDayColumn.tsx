import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onEventMoved?: () => void;
}

function groupOverlappingEvents(events: OrbitEventData[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
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
  onEventMoved,
}: OrbitCalendarDayColumnProps) {
  const isToday =
    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const columnRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState(0);

  // ✅ Spaltenbreite live messen (für X-Snap)
  useEffect(() => {
    if (!columnRef.current) return;

    const el = columnRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setColumnWidth(rect.width || 0);
    });

    ro.observe(el);

    // initial
    const rect = el.getBoundingClientRect();
    setColumnWidth(rect.width || 0);

    return () => ro.disconnect();
  }, []);

  const [dragPreviewOffsets, setDragPreviewOffsets] = useState<
    Record<string, number>
  >({});

  const [dragPreviewOffsetsX, setDragPreviewOffsetsX] = useState<
    Record<string, number>
  >({});

  const [dragBaseTops, setDragBaseTops] = useState<Record<string, number>>({});

  async function handleEventDrop(event: OrbitEventData, deltaMinutes: number) {
    if (!deltaMinutes) return;

    const { addMinutesISO } = await import("@/lib/orbit/time/addMinutes");

    const starts_at = addMinutesISO(event.starts_at, deltaMinutes);
    const ends_at = addMinutesISO(event.ends_at, deltaMinutes);

    const res = await fetch("/api/orbit/update/calendar/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        starts_at,
        ends_at,
      }),
    });

    if (!res.ok) {
      console.error("Failed to update event");
      return;
    }

    onEventMoved?.();

    // ✅ Reset nach Drop (Y + X + BaseTop)
    setDragPreviewOffsets((p) => ({ ...p, [event.id]: 0 }));
    setDragPreviewOffsetsX((p) => ({ ...p, [event.id]: 0 }));
    setDragBaseTops((p) => {
      const copy = { ...p };
      delete copy[event.id];
      return copy;
    });
  }

  function handlePreviewOffsetChange(eventId: string, offsetY: number) {
    setDragPreviewOffsets((prev) => ({
      ...prev,
      [eventId]: offsetY,
    }));
  }

  function handlePreviewOffsetXChange(eventId: string, offsetX: number) {
    setDragPreviewOffsetsX((prev) => ({
      ...prev,
      [eventId]: offsetX,
    }));
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const minutesFromTop = Math.max(0, Math.round((y / rowHeight) * 60));
    const totalMinutes = hourStart * 60 + minutesFromTop;

    const h = Math.min(23, Math.floor(totalMinutes / 60));
    const m = Math.min(59, totalMinutes % 60);

    const pad2 = (n: number) => String(n).padStart(2, "0");

    onCreateEvent?.({
      date: format(day, "yyyy-MM-dd"),
      start: `${pad2(h)}:${pad2(m)}`,
    });
  };

  return (
    <div
      ref={columnRef}
      className={`
        flex-1 
        border-l border-white/10 
        relative
        ${isToday ? "bg-white/[0.04]" : "bg-black/20"}
      `}
      onDoubleClick={handleDoubleClick}
    >
      {[...Array(16)].map((_, i) => (
        <div key={i} className="h-[72px] border-t border-white/[0.07] relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.04]" />
        </div>
      ))}

      {groupOverlappingEvents(events).map((group) => {
        const startTimes = group.map((e) => new Date(e.starts_at));
        const endTimes = group.map((e) => new Date(e.ends_at));

        const start = new Date(Math.min(...startTimes.map((d) => d.getTime())));
        const end = new Date(Math.max(...endTimes.map((d) => d.getTime())));

        const startHour =
          Number(formatOrbit(start, displayTZ, "H")) +
          Number(formatOrbit(start, displayTZ, "m")) / 60;

        const topPx = (startHour - hourStart) * rowHeight;
        const heightPx = Math.max(
          50,
          (Math.max(15, differenceInMinutes(end, start)) / 60) * rowHeight
        );

        if (group.length === 1) {
          const event = group[0];

          const previewOffsetY = dragPreviewOffsets[event.id] ?? 0;
          const previewOffsetX = dragPreviewOffsetsX[event.id] ?? 0;

          const baseTop =
            dragBaseTops[event.id] ??
            (() => {
              if (previewOffsetY !== 0) {
                setDragBaseTops((p) => ({ ...p, [event.id]: topPx }));
              }
              return topPx;
            })();

          return (
            <OrbitCalendarEvent
              key={event.id}
              event={event}
              top={baseTop}
              height={heightPx}
              onSelect={onSelectEvent}
              draggable
              rowHeight={rowHeight}
              snapMinutes={15}
              columnWidth={columnWidth} // ✅ wichtig für X-Snap / dayShift

              previewOffsetY={previewOffsetY}
              onPreviewOffsetChange={handlePreviewOffsetChange}

              previewOffsetX={previewOffsetX}
              onPreviewOffsetXChange={handlePreviewOffsetXChange}

              onDrop={handleEventDrop}
            />
          );
        }

        return (
          <div
            key={`group-${group[0].id}`}
            style={{ top: topPx, height: heightPx }}
            onClick={() =>
              onSelectEvent?.({ ...group[0], __group: group } as any)
            }
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
            <div className="text-[10px] text-gray-300">Klick für Details</div>
          </div>
        );
      })}
    </div>
  );
}
