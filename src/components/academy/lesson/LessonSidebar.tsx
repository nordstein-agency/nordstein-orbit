import Link from "next/link";

interface LessonSidebarProps {
  moduleTitle: string;
  lessons: {
    id: string;
    title: string;
    description?: string | null;
  }[];
  currentLessonId: string;
}

export default function LessonSidebar({
  moduleTitle,
  lessons,
  currentLessonId,
}: LessonSidebarProps) {
  return (
    <aside
      className="
        flex flex-col
        w-72 
        min-h-[calc(100vh-56px)]
        mt-[56px]            /* Abstand unter die Navbar */
        ml-4
        rounded-2xl
        border border-white/10
        bg-gradient-to-b from-[#1a0f17]/70 via-black/70 to-[#0d070e]/70
        backdrop-blur-xl
        shadow-[0_0_25px_#a7569233]
        p-6 space-y-6
        
      "
    >
      {/* Title */}
      <div>
        <h2 className="uppercase tracking-widest text-xs text-[#d8a5d0] mb-1">
          Modul
        </h2>
        <h1 className="text-base font-semibold text-white">{moduleTitle}</h1>
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        {lessons.map((l) => {
          const active = l.id === currentLessonId;

          return (
            <Link
              href={`/academy/lesson/${l.id}`}
              key={l.id}
              className={`
                block p-3 rounded-xl transition-all border
                ${
                  active
                    ? "bg-[#1a0f17] border-[#d8a5d0]/60 shadow-[0_0_15px_#d8a5d055]"
                    : "bg-black/30 border-white/10 hover:border-[#d8a5d0]/40 hover:bg-[#1a0f17]/30"
                }
              `}
            >
              <p className="font-medium text-sm text-white">{l.title}</p>
              {l.description && (
                <p className="text-xs text-gray-400">{l.description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
