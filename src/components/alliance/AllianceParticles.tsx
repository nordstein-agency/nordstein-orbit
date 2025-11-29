"use client";

import { useEffect, useState } from "react";

export default function AllianceParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Runs ONLY on client → safe
    const items = [...Array(28)].map((_, i) => {
      return {
        id: i,
        size: Math.floor(Math.random() * 10) + 6,
        top: Math.random() * 100,
        left: Math.random() * 100,
        anim:
          Math.random() > 0.5
            ? "particleFloat 22s ease-in-out infinite"
            : "particleDrift 32s ease-in-out infinite",
        delay: i * 0.7,
      };
    });

    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="gold-particle"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.top}%`,
            left: `${p.left}%`,
            animation: p.anim,
            animationDelay: `${p.delay}s`,
            position: "absolute",
          }}
        />
      ))}
    </div>
  );
}
