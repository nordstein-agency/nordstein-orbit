// src/components/orbit/calendar/OrbitCalendarHeader.tsx
import { format, addDays } from "date-fns";
import {de} from "date-fns/locale/de";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropdown } from "@/components/orbit/OrbitDropdown";


interface OrbitCalendarHeaderProps {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;

  // 🕒 Zeitzonen-Anzeige
  displayTimezoneSetting: string | null;
  onChangeDisplayTimezone: (tz: string | null) => void;
}


export default function OrbitCalendarHeader({
  weekStart,
  onPrev,
  onNext,
  onToday,
  displayTimezoneSetting,
  onChangeDisplayTimezone,
}: OrbitCalendarHeaderProps) {

  const weekEnd = addDays(weekStart, 6);

  const timezoneOptions = [
  { label: "Business (Europe/Vienna) ", value: "business" },
  { label: "Local (Browser) ", value: "local" },
  // später easy erweiterbar:
  // { label: "🇺🇸 Phoenix", value: "America/Phoenix" },
];


  return (
    <header className="space-y-3 animate-fade-in">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase">
        Orbit Kalender
      </p>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
            Analysen. Beratungen. Recruiting.
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">
            Plane deine Woche wie im Apple Kalender – aber direkt im Orbit Cockpit.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Woche{" "}
            <span className="font-medium text-[#d8a5d0]">
              {format(weekStart, "dd.MM.", { locale: de })} –{" "}
              {format(weekEnd, "dd.MM.yyyy", { locale: de })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
  {/* Zeitzonen-Dropdown */}
  <div className="min-w-[220px]">
  <OrbitDropdown
    options={timezoneOptions}
    value={displayTimezoneSetting ?? "business"}
    placeholder="Zeitzone wählen"
    onChange={(v) => {
      onChangeDisplayTimezone(v === "business" ? null : v);
    }}
  />
</div>


  <OrbitButton
    onClick={onPrev}
    className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
  >
    ←
  </OrbitButton>

  <OrbitButton
    onClick={onToday}
    className="px-4 py-2 text-xs bg-white/10 border border-white/20 rounded-full hover:bg-white/20"
  >
    Heute
  </OrbitButton>

  <OrbitButton
    onClick={onNext}
    className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10"
  >
    →
  </OrbitButton>
</div>

      </div>
    </header>
  );
}
