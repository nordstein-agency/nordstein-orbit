interface DayStats {
  vk?: number;
  vg?: number;
  ea?: number;
  eg?: number;
  sem?: number;
  on?: number;
  up?: number;
  pg?: number;
  abs?: number;
  eh?: number;
}

interface Props {
  weekDays: Date[];
  statsByDay: Record<string, DayStats[]>;
onSelectDay?: (date: string, stats: DayStats | null) => void;}

const LEFT_LABELS = ["VK", "VG", "EA", "EG", "SEM", "ON", "UP", "PG"] as const;
const RIGHT_LABELS = ["ABS", "EH"] as const;

function renderValue(val?: number) {
  if (!val || val <= 0) return "";
  return val;
}

export default function OrbitCalendarDayStatsRow({
  weekDays,
  statsByDay,
  onSelectDay,
}: Props) {
  return (
    <div className="flex border-t border-white/10 bg-black/30">
      <div className="w-20 border-r border-white/10" />

      <div className="flex flex-1">
        {weekDays.map((day) => {
          const dateKey = day.toISOString().slice(0, 10);
          const stats = statsByDay[dateKey]?.[0] ?? null;

          return (
             
            <div
              key={dateKey}
              onClick={() => onSelectDay?.(dateKey, stats ?? null)}
              className="
                flex-1
                border-l border-white/10
                px-2 py-3
                text-[11px]
                cursor-pointer
                hover:bg-white/[0.035]
                transition
              "
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  {LEFT_LABELS.map((l) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-semibold text-[#d8a5d0]">
                        {stats
                          ? renderValue(
                              (stats as any)[l.toLowerCase()]
                            )
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-0.5 border-l border-white/10 pl-2">
                  {RIGHT_LABELS.map((l) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-semibold text-[#d8a5d0]">
                        {stats
                          ? renderValue(
                              (stats as any)[l.toLowerCase()]
                            )
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
