"use client";

interface OrbitTextareaProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function OrbitTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
}: OrbitTextareaProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs text-gray-300 tracking-wide pl-1">
          {label}
        </label>
      )}

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 rounded-xl 
          bg-black/40 border border-white/10 
          text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-[#b879a8]/40
          focus:border-[#d8a5d0]/40
          transition-all duration-150
          resize-none
          ${className}
        `}
      />
    </div>
  );
}
