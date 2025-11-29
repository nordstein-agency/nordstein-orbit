// src/components/alliance/AllianceDropdown.tsx

"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface AllianceDropdownProps {
  options: Option[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function AllianceDropdown({
  options,
  value,
  placeholder,
  onChange,
}: AllianceDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // -------------------------------
  // Close on click outside
  // -------------------------------
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative text-sm w-full">
      {/* ------------------------ */}
      {/* TRIGGER BUTTON */}
      {/* ------------------------ */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full px-4 py-2 rounded-xl
          bg-[#1f1620]/70 border border-[#3a2238]
          text-left text-gray-200
          flex justify-between items-center
          hover:border-[#b88a2a]/60
          hover:shadow-[0_0_15px_rgba(255,220,160,0.25)]
          transition-all duration-150
          backdrop-blur-xl
        `}
      >
        <span className={selectedOption ? "text-white" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Arrow */}
        <span
          className={`
            transition-transform duration-200 text-[#e4c46d]
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {/* ------------------------ */}
      {/* DROPDOWN MENU */}
      {/* ------------------------ */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 z-50
            rounded-xl overflow-hidden
            bg-[#1f1620]/90 backdrop-blur-xl
            border border-[#3a2238]
            shadow-[0_0_25px_rgba(255,230,180,0.15)]
            animate-fade-scale
          "
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 transition-all
                ${
                  o.value === value
                    ? "bg-white/10 text-[#f3dca9]"
                    : "text-gray-200 hover:bg-white/5 hover:text-[#e6c476]"
                }
              `}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------ */}
      {/* ANIMATION KEYFRAMES */}
      {/* ------------------------ */}
      <style>
        {`
          @keyframes fadeScale {
            0% { opacity: 0; transform: scale(0.97); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-fade-scale {
            animation: fadeScale 0.15s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
