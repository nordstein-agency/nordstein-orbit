import React, { ReactNode } from "react";

interface OrbitCardProps {
  children: ReactNode;
  className?: string;
}

export default function OrbitCard({ children, className = "" }: OrbitCardProps) {
  return (
    <div
      className={
        "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_0_40px_rgba(150,75,255,0.15)] p-4 " +
        className
      }
    >
      {children}
    </div>
  );
}
