"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const cards = [
  {
    title: "Leads",
    description: "Lead Management, Projekte, AI-Scoring",
    href: "/leads",
    color: "from-[#d8a5d0] to-[#a75692]",
    delay: 0.0
  },
  {
    title: "Academy",
    description: "Schulungen, Kurse, Zertifikate",
    href: "/academy",
    color: "from-[#8b5bb3] to-[#b879a8]",
    delay: 0.05
  },
  {
    title: "Coming Soon",
    description: "Neue Features & Module",
    href: "/coming-soon",
    color: "from-[#a05fb5] to-[#5a2e7e]",
    delay: 0.1
  },
  {
    title: "Alliance",
    description: "Partner, Projekte, Upsell-Potential",
    href: "/alliance",
    color: "from-[#b76bcf] to-[#7d3c97]",
    delay: 0.15
  }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-28 px-6">
      
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-semibold mb-10 text-white tracking-wide"
      >
        Willkommen im <span className="text-[#d8a5d0]">Orbit</span>
      </motion.h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: card.delay,
              ease: "easeOut"
            }}
          >
            <Link href={card.href}>
              <div
                className="group relative rounded-2xl p-6 h-40 cursor-pointer
                bg-black/40 backdrop-blur-xl border border-white/10
                shadow-xl hover:shadow-[0_0_35px_#d8a5d055]
                transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-30 
                  bg-gradient-to-br ${card.color} blur-2xl transition-all`}
                />

                {/* Title */}
                <h2 className="text-xl font-semibold text-white relative z-10">
                  {card.title}
                </h2>

                {/* Description */}
                <p className="text-white/70 mt-2 text-sm relative z-10">
                  {card.description}
                </p>

                {/* Icon */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: card.delay + 0.3 }}
                  className="absolute bottom-4 right-4"
                >
                  <ArrowUpRight
                    className="w-6 h-6 text-white/60 group-hover:text-white
                    group-hover:scale-125 transition-all"
                  />
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
