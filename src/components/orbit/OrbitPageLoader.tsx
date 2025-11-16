"use client";

import { useEffect, useState } from "react";

export default function OrbitPageLoader({
  delay = 400,      // minimale Ladezeit
  fadeDuration = 300 // Dauer des Fade-Out
}: {
  delay?: number;
  fadeDuration?: number;
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
        fixed inset-0 z-50 flex flex-col items-center justify-center
        bg-black/90 backdrop-blur-xl
        transition-opacity duration-[${fadeDuration}ms]
        ${fadeOut ? "opacity-0" : "opacity-100"}
      `}
    >
      <div
        className="
          relative w-24 h-24 
          animate-[orbit-spin_6s_linear_infinite]
          flex items-center justify-center
        "
      >
        <div className="absolute inset-0 rounded-full blur-xl bg-[#b244ff]/30" />

        <img
          src="/orbit.png"
          alt="Orbit Loader"
          className="
            w-16 h-16 
            animate-[orbit-float_3s_ease-in-out_infinite]
            drop-shadow-[0_0_15px_#b244ff]
          "
        />
      </div>

      <p className="mt-6 text-sm text-gray-400 tracking-wide">
        Orbit lädt dein Dashboard…
      </p>
    </div>
  );
}
