"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function OrbitLoader() {
  return (
    <div className="w-full h-[40vh] flex flex-col items-center justify-center">
      {/* LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Image
          src="/loading.png"
          alt="Orbit Logo"
          width={120}
          height={120}
          className="opacity-90"
        />
      </motion.div>

      {/* SPINNER */}
      <motion.div
        className="
          mt-6 h-10 w-10 
          border-4 border-white/20 
          border-t-[#B244FF]
          rounded-full
        "
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}
