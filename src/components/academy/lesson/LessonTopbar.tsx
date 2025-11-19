import Link from "next/link";
import { OrbitButtonLink } from "@/components/orbit/OrbitButton";

interface LessonTopbarProps {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  backHref: string;
  progressPercent: number; // 0–100
}

export default function LessonTopbar({
  courseTitle,
  moduleTitle,
  lessonTitle,
  backHref,
  progressPercent,
}: LessonTopbarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent || 0));

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 mb-4 shadow-[0_0_30px_rgba(150,80,140,0.35)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#d8a5d0] mb-1">
            {courseTitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
            <span className="font-semibold text-white">{moduleTitle}</span>
            <span className="opacity-50">/</span>
            <span className="text-[#d8a5d0]">{lessonTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrbitButtonLink
            href={backHref}
            variant="secondary"
            className="text-xs"
          >
            ← Zurück zum Kurs
          </OrbitButtonLink>
        </div>
      </div>

      {/* Progressbar */}
      <div className="w-full h-[6px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#d8a5d0] rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
