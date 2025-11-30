// app/wallet/success/page.tsx
"use client";

import Link from "next/link";
import OrbitButton from "@/components/orbit/OrbitButton";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function WalletSuccessPage() {
  return (
    <div className="min-h-screen px-6 pt-24 pb-20 flex flex-col items-center text-center relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#451a3d]/20 to-black opacity-40 pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg w-full space-y-8"
      >
        <CheckCircle className="w-20 h-20 text-[#B244FF] mx-auto" />

        <h1 className="text-4xl font-bold text-white">Zahlung erfolgreich</h1>

        <p className="text-white/60 text-lg leading-relaxed">
          Deine Credits wurden erfolgreich deinem Orbit-Wallet gutgeschrieben.
          Vielen Dank für deinen Kauf.
        </p>

        <div className="flex flex-col gap-4 mt-10">
          <Link href="/wallet">
            <OrbitButton className="w-full bg-[#B244FF] hover:bg-[#9f35e6]">
              Zum Wallet
            </OrbitButton>
          </Link>

          <Link href="/dashboard">
            <OrbitButton className="w-full bg-white/10 hover:bg-white/20 text-white">
              Zurück zum Dashboard
            </OrbitButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
