"use client";

import AlliancePageTransitions from "@/components/alliance/AlliancePageTransitions";

export default function AllianceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlliancePageTransitions>
      {children}
    </AlliancePageTransitions>
  );
}
