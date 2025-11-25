import React, { ReactNode } from "react";

interface OrbitSectionTitleProps {
  children: ReactNode;
}

export default function OrbitSectionTitle({ children }: OrbitSectionTitleProps) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-slate-200 mb-3">
      {children}
    </h2>
  );
}
