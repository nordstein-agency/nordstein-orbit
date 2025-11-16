// app/academy/layout.tsx
import type { ReactNode } from "react";
import { AcademySidebar } from "@/components/academy/AcademySidebar";

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
<div className="min-h-screen bg-transparent text-white relative">
      {/* Platz für deine Navbar oben (die ist fixed) */}
      <div className="pt-12 flex">
        {/* Sidebar */}

         <AcademySidebar /> 

        {/* Content-Bereich */}
        <div className="flex-1 px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
