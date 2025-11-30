// src/components/orbit/OrbitModal.tsx
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0a0714] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-xl relative">
        <button
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
