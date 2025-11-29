"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlobalPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Verhindert "Flash" beim ersten Laden / RSC pre-render
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kleiner Delay damit React-Tree stabil ist bevor wir animieren
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </motion.div>
  );
}
