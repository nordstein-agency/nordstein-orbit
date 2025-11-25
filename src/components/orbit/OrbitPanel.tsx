import React, { ReactNode } from "react";

interface OrbitPanelProps {
  children: ReactNode;
  className?: string;
}

export default function OrbitPanel({ children, className = "" }: OrbitPanelProps) {
  return (
    <div
      className={
        "rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] " +
        className
      }
    >
      {children}
    </div>
  );
}
