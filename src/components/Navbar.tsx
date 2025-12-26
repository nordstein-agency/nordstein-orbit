

"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useOrbitRole } from "@/hooks/useOrbitRole";

export default function Navbar() {
  const user = useUser();
  const role = useOrbitRole();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">


        <Link
          href="/dashboard"
          className="text-2xl font-bold tracking-wider text-white hover:text-[#e6c7df] transition"
        >
          ORBIT
        </Link>


        {user && (
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-white text-2xl"
          >
            ☰
          </button>
        )}


        {user ? (
          <div className="hidden md:flex gap-10">
            <Link href="/dashboard" className="orbit-nav-link">
              Dashboard
            </Link>
            <Link href="/leads" className="orbit-nav-link">
              Leads
            </Link>
            <Link href="/academy" className="orbit-nav-link">
              Academy
            </Link>
            <Link
              href="/alliance"
              className="orbit-nav-link orbit-nav-link-alliance relative"
            >
              Alliance
              <span className="gold-underline"></span>
            </Link>
          </div>
        ) : (
          <div />
        )}


        {user ? (
          <div className="hidden md:flex items-center gap-4">


            <Link
              href="/activity"
              className="orbit-nav-link flex items-center hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white/80"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.918l-7.5 4.375a2.25 2.25 0 01-2.31 0L3.32 8.911A2.25 2.25 0 012.25 6.993V6.75"
                />
              </svg>
            </Link>


            <Link
              href="/calendar"
              className="orbit-nav-link flex items-center hover:text-white"
              title="Kalender"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white/80"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10m-11 8h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </Link>


            <Link
              href="/logout"
              className="orbit-nav-link text-red-300 hover:text-red-400"
            >
              Abmelden
            </Link>
          </div>
        ) : (
          <Link href="/dashboard" className="orbit-nav-link">
            Login
          </Link>
        )}
      </div>


      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex flex-col">


          <div className="flex justify-between bg-black items-center px-6 py-4 border-b border-white/10">
            <span className="text-xl font-bold text-white">ORBIT</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-white text-2xl"
            >
              ✕
            </button>
          </div>


          <div className="flex flex-col px-6 py-8 gap-6 text-lg">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-white">
              Dashboard
            </Link>
            <Link href="/leads" onClick={() => setMobileOpen(false)} className="text-white">
              Leads
            </Link>
            <Link href="/academy" onClick={() => setMobileOpen(false)} className="text-white">
              Academy
            </Link>
            <Link href="/alliance" onClick={() => setMobileOpen(false)} className="text-white">
              Alliance
            </Link>

            <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
              <Link href="/calendar" onClick={() => setMobileOpen(false)} className="text-white">
                Kalender
              </Link>
              <Link href="/activity" onClick={() => setMobileOpen(false)} className="text-white">
                Aktivität
              </Link>
              <Link href="/logout" onClick={() => setMobileOpen(false)} className="text-red-400">
                Abmelden
              </Link>
            </div>
          </div>

        </div>
      )}

    </nav>
  );
}



