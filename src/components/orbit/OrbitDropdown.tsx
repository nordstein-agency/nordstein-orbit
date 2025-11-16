"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface OrbitDropdownProps {
  options: Option[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function OrbitDropdown({
  options,
  value,
  placeholder,
  onChange,
}: OrbitDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside handling
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
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full px-4 py-2 rounded-xl 
          bg-black/40 border border-white/10 
          text-left text-gray-200
          flex justify-between items-center
          hover:border-[#d8a5d0]/40 transition-all duration-150
        "
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>

        {/* Arrow */}
        <span
          className={`
            transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2 
            bg-black/70 backdrop-blur-xl 
            border border-white/10 
            rounded-xl overflow-hidden 
            shadow-[0_0_25px_#a7569233]
            animate-fade-scale
            z-50
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
                w-full text-left px-4 py-2
                hover:bg-white/10 transition-all 
                ${o.value === value ? "text-[#d8a5d0]" : "text-gray-200"}
              `}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* Animation Keyframes */}
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
