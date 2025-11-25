"use client";

import { useState } from "react";
import OrbitCalendarHeader from "@/components/orbit/calendar/OrbitCalendarHeader";
import OrbitCalendarWeekView from "@/components/orbit/calendar/OrbitCalendarWeekView";
import OrbitEventModal from "@/components/orbit/calendar/OrbitEventModal";

interface CalendarPageClientProps {
  weekStart: Date;
  weekDays: Date[];
  hours: number[];
  eventsByDay: Record<string, any[]>;
}

export default function CalendarPageClient({
  weekStart,
  weekDays,
  hours,
  eventsByDay,
}: CalendarPageClientProps) {
  
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="
      pt-20 
      px-6 
      min-h-screen 
      text-white
      bg-gradient-to-br from-[#120914] via-[#0b0710] to-[#050013]
    ">

      {/* DIMMED CONTAINER / CENTERED LIKE ACADEMY */}
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <OrbitCalendarHeader
          weekStart={weekStart}
          onPrev={() => console.log("Prev week")}
          onNext={() => console.log("Next week")}
          onToday={() => console.log("Today")}
        />

        {/* CALENDAR */}
        <div className="
          rounded-3xl 
          border border-white/10 
          bg-black/40 
          backdrop-blur-2xl 
          shadow-[0_0_40px_rgba(150,75,255,0.25)]
          overflow-hidden
        ">
          <OrbitCalendarWeekView
            weekDays={weekDays}
            hours={hours}
            eventsByDay={eventsByDay}
          />
        </div>

      </div>

      {/* EVENT MODAL */}
      <OrbitEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* FLOATING + BUTTON */}
      <button
        onClick={() => setModalOpen(true)}
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
