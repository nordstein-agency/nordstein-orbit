"use client";

interface AllianceCardProps {
  title: string;
  desc: string;
}

export default function AllianceCard({ title, desc }: AllianceCardProps) {
  return (
    <div className="
      bg-[#2a1b29]/40 
      border border-[#3a2238] 
      p-6 rounded-xl 
      space-y-2
      hover:border-[#e4c46d]/40
      hover:shadow-[0_0_20px_rgba(255,215,130,0.15)]
      transition-all duration-300
    ">
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-[#cbb8c8] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
