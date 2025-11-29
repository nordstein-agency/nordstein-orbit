"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AlliancePageTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLoader, setShowLoader] = useState(false);

  // Trigger loader before route change
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http")) return;
      if (href === pathname) return;

      // Hard enable loader
      setShowLoader(true);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Hide loader after page fully loaded
  useEffect(() => {
    if (!showLoader) return;

    const t = setTimeout(() => setShowLoader(false), 900);
    return () => clearTimeout(t);
  }, [pathname, showLoader]);

  return (
    <div className="relative">

      {/* TEST: force visibility */}
      {showLoader && (
  <div
    className="fixed inset-0 flex items-center justify-center pointer-events-auto"
    style={{
      background: "rgba(18, 12, 20, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      zIndex: 999999999999,
    }}
  >
    {/* GOLD RING LOADER */}
    <div className="relative flex items-center justify-center">

      <div
        className="orbit-gold-ring"
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "6px solid rgba(255, 223, 148, 0.25)",
          borderTopColor: "#f3dca9", // Gold
          animation: "spin 1.2s linear infinite",
          boxShadow: "0 0 25px rgba(255, 223, 148, 0.45)",
        }}
      />
    </div>
  </div>
)}






      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
