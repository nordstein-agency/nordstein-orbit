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
}

const LABELS = ["VK", "VG", "EA", "EG", "SEM", "ON", "UP", "PG"] as const;

export default function OrbitCalendarDayStatsRow({
  weekDays,
  statsByDay,
}: Props) {
  return (
    <div className="flex border-t border-white/10 bg-black/30">
      {/* Leer-Spalte links (Zeit) */}
      <div className="w-20 border-r border-white/10" />

      {/* Tage */}
      <div className="flex flex-1">
        {weekDays.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const stats = statsByDay[key]?.[0];

          return (
            <div
              key={key}
              className="flex-1 border-l border-white/10 px-2 py-3 text-[11px]"
            >
              {LABELS.map((l) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-semibold">
                    {stats ? (stats as any)[l.toLowerCase()] ?? "" : ""}
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
