"use client";
import React, { ReactNode } from "react";

interface OrbitModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function OrbitModal({ open, onClose, children }: OrbitModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70
        backdrop-blur-sm
        animate-orbit-backdrop
      "
    >
      <div
        className="
          relative
          w-full max-w-lg
          bg-[#0a0714]
          border border-white/10
          rounded-3xl
          p-6
          shadow-[0_30px_80px_rgba(0,0,0,0.75)]
          animate-orbit-modal
          will-change-transform
        "
      >
        <button
          className="
            absolute right-4 top-4
            text-white/40 hover:text-white
            transition
          "
          onClick={onClose}
        >
          ✕
        </button>

        {children}
      </div>

      <style>{`
        /* ---------------------------
           Backdrop (Apple-like)
        ---------------------------- */
        @keyframes orbitBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-orbit-backdrop {
          animation: orbitBackdrop 0.18s ease-out forwards;
        }

        /* ---------------------------
           Modal "Aufschwingen"
           (Apple / macOS Style)
        ---------------------------- */
        @keyframes orbitModal {
          0% {
            opacity: 0;
            transform: scale(0.88);
          }
          55% {
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-orbit-modal {
          animation: orbitModal
            0.42s
            cubic-bezier(0.22, 0.61, 0.36, 1)
            forwards;
        }
      `}</style>
    </div>
  );
}
