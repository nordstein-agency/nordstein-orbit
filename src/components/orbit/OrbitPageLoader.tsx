"use client";

import { useEffect, useState } from "react";
import OrbitLoaderCore from "./OrbitLoaderCore";

export default function OrbitPageLoader({
  delay = 400,
  fadeDuration = 300,
  label = "Orbit lädt dein Dashboard…",
}: {
  delay?: number;
  fadeDuration?: number;
  label?: string;
}) {


  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), fadeDuration);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, fadeDuration]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/90 backdrop-blur-xl
        transition-opacity
        ${fadeOut ? "opacity-0" : "opacity-100"}
      `}
      style={{ transitionDuration: `${fadeDuration}ms` }}
    >
<OrbitLoaderCore label={label} size={96} />
    </div>
  );
}
