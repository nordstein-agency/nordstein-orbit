// app/wallet/earn/page.tsx
"use client";

import Link from "next/link";
import OrbitButton from "@/components/orbit/OrbitButton";
import { motion } from "framer-motion";
import { Award, GraduationCap, PlusCircle, Zap, BadgeCheck } from "lucide-react";

export default function EarnCreditsPage() {
  return (
    <div className="min-h-screen px-6 pt-24 pb-20 max-w-3xl mx-auto space-y-14 relative">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d113b]/40 to-black opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Credits verdienen</h1>
        <p className="text-white/60 text-lg">
          Nutze Orbit aktiv und sammle kostenlose Credits durch dein Engagement.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 grid gap-8">

        {/* 1 — Academy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
        >
          <div className="flex items-center gap-4">
            <GraduationCap className="w-10 h-10 text-[#B244FF]" />
            <h2 className="text-xl font-semibold text-white">Kurse absolvieren</h2>
          </div>

          <p className="text-white/60">
            Für das erfolgreiche Abschließen von Orbit-Academy Kursen erhältst du regelmäßig
            kostenlose Credits als Belohnung.
          </p>

          <Link href="/academy">
            <OrbitButton className="mt-3">Zur Academy</OrbitButton>
          </Link>
        </motion.div>

        {/* 2 — Leads hinzufügen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
        >
          <div className="flex items-center gap-4">
            <PlusCircle className="w-10 h-10 text-[#B244FF]" />
            <h2 className="text-xl font-semibold text-white">Neue Leads einreichen</h2>
          </div>

          <p className="text-white/60">
            Für hochwertige neue Leads erhältst du Bonus-Credits, sobald sie durch das Orbit-Team
            validiert wurden.
          </p>

          <Link href="/leads/upload">
            <OrbitButton className="mt-3">Lead einreichen</OrbitButton>
          </Link>
        </motion.div>

        {/* 3 — Daily Missions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
        >
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-[#B244FF]" />
            <h2 className="text-xl font-semibold text-white">Tägliche Challenges</h2>
          </div>

          <p className="text-white/60">
            Aktiviere Orbit täglich, erledige Mini-Aufgaben und hol dir wiederholbare Bonuspunkte.
          </p>

          <OrbitButton className="mt-3 bg-white/10 hover:bg-white/20">
            Bald verfügbar
          </OrbitButton>
        </motion.div>

        {/* 4 — Profil vervollständigen */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
        >
          <div className="flex items-center gap-4">
            <BadgeCheck className="w-10 h-10 text-[#B244FF]" />
            <h2 className="text-xl font-semibold text-white">Profil vervollständigen</h2>
          </div>

          <p className="text-white/60">
            Erhalte einmalig Credits, wenn du dein Orbit-Profil vollständig ausfüllst und verifizierst.
          </p>

          <OrbitButton className="mt-3 bg-white/10 hover:bg-white/20">
            Bald verfügbar
          </OrbitButton>
        </motion.div>
      </div>

      {/* Back Button */}
      <div className="relative z-10 text-center">
        <Link href="/wallet">
          <OrbitButton className="bg-white/10 hover:bg-white/20">Zurück zum Wallet</OrbitButton>
        </Link>
      </div>

    </div>
  );
}
