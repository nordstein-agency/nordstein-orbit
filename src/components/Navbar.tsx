"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useOrbitRole } from "@/hooks/useOrbitRole";

export default function Navbar() {
  const user = useUser();
  const role = useOrbitRole();


  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-wider text-white hover:text-[#e6c7df] transition"
        >
          ORBIT
        </Link>

        {/* CENTER NAVIGATION */}
        {user ? (
          <div className="flex gap-10">
            <Link href="/dashboard" className="orbit-nav-link">Dashboard</Link>
            <Link href="/leads" className="orbit-nav-link">Leads</Link>
            <Link href="/academy" className="orbit-nav-link">Academy</Link>

            
          </div>
        ) : (
          <div />
        )}

        {/* RIGHT SIDE */}
        {user ? (
          <Link 
            href="/logout" 
            className="orbit-nav-link text-red-300 hover:text-red-400"
          >
            Abmelden
          </Link>
        ) : (
          <Link 
            href="/login" 
            className="orbit-nav-link"
          >
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}
