// src/components/orbit/calendar/OrbitCalendarDayStatsRow.tsx
interface DayStats {
  vk?: number;
  vg?: number;
  ea?: number;
  eg?: number;
  sem?: number;
  on?: number;
  up?: number;
  pg?: number;
}

interface Props {
  weekDays: Date[];
  statsByDay: Record<string, DayStats[]>;
  onSelectDay: (date: string) => void;
}

const LABELS = ["VK", "VG", "EA", "EG", "SEM", "ON", "UP", "PG"] as const;

export default function OrbitCalendarDayStatsRow({
  weekDays,
  statsByDay,
  onSelectDay,
}: Props) {
  return (
    <div className="flex border-t border-white/10 bg-black/30">
      {/* Leer-Spalte links */}
      <div className="w-20 border-r border-white/10" />

      <div className="flex flex-1">
        {weekDays.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const stats = statsByDay[key]?.[0];

          return (
            <div
              key={key}
              onClick={() => onSelectDay(key)}
              className="
                flex-1 border-l border-white/10 px-2 py-3 text-[11px]
                cursor-pointer hover:bg-white/5 transition
              "
            >
              {LABELS.map((l) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-semibold text-[#d8a5d0]">
  {stats && (stats as any)[l.toLowerCase()] > 0
    ? (stats as any)[l.toLowerCase()]
    : ""}
</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
