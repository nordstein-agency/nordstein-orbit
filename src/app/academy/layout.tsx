"use client";

import { usePathname } from "next/navigation";
import { AcademySidebar } from "@/components/academy/AcademySidebar";
import type { ReactNode } from "react";
import { Orbit } from "lucide-react";
import OrbitPageTransition from "@/components/orbit/OrbitPageTransitions";
import OrbitPageTransitions from "@/components/orbit/OrbitPageTransitions";

export default function AcademyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Lesson-Player full-focus mode
  const isLesson = pathname.startsWith("/academy/lesson");

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      
      <div className={` flex`}>
        
        {/* Sidebar NUR wenn NICHT Lesson */}
        {!isLesson && <AcademySidebar />}

        {/* CONTENT-BEREICH */}
        <div
          className={`
            flex-1  py-8
            ${!isLesson ? "ml-16 md:ml-60" : "ml-0"}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
