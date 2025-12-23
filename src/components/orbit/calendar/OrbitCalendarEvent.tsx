import { useRef } from "react";
import { formatOrbit, resolveDisplayTZ } from "@/lib/orbit/timezone";

export interface OrbitEventData {
  id: string;
  starts_at: string;
  ends_at: string;
  title: string;
  type?: string;
  location?: string | null;
  notes?: string | null;

  // optional: online stuff, falls vorhanden
  meeting_link?: string | null;
}

interface OrbitCalendarEventProps {
  event: OrbitEventData;
  top: number;
  height: number;
  onSelect?: (event: OrbitEventData) => void;

  draggable?: boolean;
  rowHeight?: number; // px pro Stunde (bei dir 72)
  snapMinutes?: number; // default 15

  // Y Drag
  previewOffsetY?: number;
  onPreviewOffsetChange?: (eventId: string, offsetY: number) => void;

  // X Drag
  previewOffsetX?: number;
  onPreviewOffsetXChange?: (eventId: string, offsetX: number) => void;

  // Für Day-Snap
  columnWidth?: number; // Breite einer Tages-Spalte in px

  onDrop?: (event: OrbitEventData, deltaMinutes: number) => void;
}

export default function OrbitCalendarEvent({
  event,
  top,
  height,
  onSelect,

  draggable = false,
  rowHeight = 72,
  snapMinutes = 15,

  previewOffsetY = 0,
  onPreviewOffsetChange,

  previewOffsetX = 0,
  onPreviewOffsetXChange,
  columnWidth = 0,

  onDrop,
}: OrbitCalendarEventProps) {
  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);

  const tz = resolveDisplayTZ(null);

  // -----------------------------
  // Drag State (stabil über Renders)
  // -----------------------------
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);

  const pxPerMinute = rowHeight / 60;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggable) return;

    // nur linke Maustaste / primary pointer
    if ((e as any).button !== undefined && (e as any).button !== 0) return;

    draggingRef.current = true;

    // Start relativ zur aktuellen Preview-Position
    startYRef.current = e.clientY - previewOffsetY;
    startXRef.current = e.clientX - previewOffsetX;

    e.currentTarget.setPointerCapture(e.pointerId);

    e.preventDefault();
    e.stopPropagation();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggable) return;
    if (!draggingRef.current) return;

    // -----------------------------
    // Y (Zeit)
    // -----------------------------
    const deltaY = e.clientY - startYRef.current;
    const minutes = deltaY / pxPerMinute;
    const snappedMinutes = Math.round(minutes / snapMinutes) * snapMinutes;
    const snappedPxY = snappedMinutes * pxPerMinute;
    onPreviewOffsetChange?.(event.id, snappedPxY);

    // -----------------------------
    // X (Tag)
    // -----------------------------
    if (columnWidth && columnWidth > 10) {
      const deltaX = e.clientX - startXRef.current;

      // Snap auf ganze Tages-Spalten
      const snappedDays = Math.round(deltaX / columnWidth);
      const snappedPxX = snappedDays * columnWidth;

      onPreviewOffsetXChange?.(event.id, snappedPxX);
    } else {
      // Wenn keine Breite bekannt: trotzdem raw bewegen (optional)
      const deltaX = e.clientX - startXRef.current;
      onPreviewOffsetXChange?.(event.id, deltaX);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggable) return;
    if (!draggingRef.current) return;

    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Minuten aus Y
    const minutesMoved = previewOffsetY / (rowHeight / 60);
    const snappedMinutes =
      Math.round(minutesMoved / snapMinutes) * snapMinutes;

    // Tage aus X
    let dayShift = 0;
    if (columnWidth && columnWidth > 10) {
      dayShift = Math.round(previewOffsetX / columnWidth);
    }

    const totalDeltaMinutes = snappedMinutes + dayShift * 1440;

    if (totalDeltaMinutes !== 0) {
      onDrop?.(event, totalDeltaMinutes);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  // Klick soll NICHT auslösen, wenn gerade gezogen wurde
  function handleClick() {
    if (Math.abs(previewOffsetY) > 6) return;
    if (Math.abs(previewOffsetX) > 6) return;
    onSelect?.(event);
  }

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
        select-none
      "
      style={{
        top,
        height,
        transform: `translate(${previewOffsetX}px, ${previewOffsetY}px)`,
        touchAction: "none",
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(event);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
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
          {formatOrbit(start, tz, "HH:mm")} – {formatOrbit(end, tz, "HH:mm")}
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
