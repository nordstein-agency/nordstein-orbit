"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ActivityLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.includes("/followups")
    ? "followups"
    : pathname.includes("/alerts")
    ? "alerts"
    : pathname.includes("/calendar")
    ? "calendar"
    : "inbox";

  return (
    <main className="min-h-screen pt-24 px-8 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[#d8a5d0]">
          Orbit · Activity
        </p>
        <h1 className="text-4xl font-semibold">Activity Center</h1>
        <p className="text-white/50 mt-2">
          Nachrichten, Follow Ups & operative Hinweise
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-3 mb-8">
        <button
          className={`text-sm pb-2 transition ${
            activeTab === "inbox"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/activity/inbox")}
        >
          Inbox
        </button>

        <button
          className={`text-sm pb-2 transition ${
            activeTab === "followups"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/activity/followups")}
        >
          Follow Ups
        </button>

        {/* vorbereitet */}
        <button
          disabled
          className="text-sm pb-2 text-white/20 cursor-not-allowed"
        >
          Alerts
        </button>
      </div>

      {children}
    </main>
  );
}
