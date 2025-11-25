// src/components/orbit/calendar/OrbitCalendarTimeColumn.tsx

interface OrbitCalendarTimeColumnProps {
  hours: number[];
}

export default function OrbitCalendarTimeColumn({
  hours,
}: OrbitCalendarTimeColumnProps) {
  return (
    <div className="w-20 border-r border-white/10 bg-black/30">
      {hours.map((hour) => (
        <div
          key={hour}
          className="
            h-[72px] 
            flex items-start justify-end 
            pr-3 pt-1
            text-[13px] text-gray-300 font-medium
          "
        >
          {String(hour).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}
