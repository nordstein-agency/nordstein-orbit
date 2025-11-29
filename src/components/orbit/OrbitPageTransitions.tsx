"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import { usePathname } from "next/navigation";

export default function OrbitPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [showLoader, setShowLoader] = useState(true);
  const [currentPath, setCurrentPath] = useState(pathname);

  const initialMount = useRef(true);

  useEffect(() => {
    // Beim ersten Initial-Load → Loader 450ms anzeigen
    if (initialMount.current) {
      initialMount.current = false;

      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 450);

      return () => clearTimeout(timer);
    }

    // Wenn der Pfad wechselt → Loader zeigen
    if (pathname !== currentPath) {
      startTransition(() => {
        setShowLoader(true);
      });

      const timer = setTimeout(() => {
        setShowLoader(false);
        setCurrentPath(pathname);
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  return (
    <>
      {/* CONTENT */}
      <div className={`${showLoader ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"} transition-all duration-500`}>
        {children}
      </div>

      {/* LOADER */}
      {showLoader && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-auto"
          style={{
            background: "rgba(16, 10, 18, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 99999999999,
          }}
        >
          <div className="relative flex items-center justify-center">

            {/* ROTATING RING */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "6px solid rgba(168, 86, 146, 0.22)",
                borderTopColor: "#d8a5d0",
                animation: "orbitSpin 1.2s linear infinite",
                boxShadow: "0 0 28px rgba(168,86,146,0.42)",
              }}
            />

            {/* KEIN LILA-PUNKT */}
          </div>

          <style>{`
            @keyframes orbitSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
