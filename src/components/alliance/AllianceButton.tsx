"use client";

interface AllianceButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "gold" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function AllianceButton({
  children,
  onClick,
  type = "button",
  variant = "gold",
  loading = false,
  disabled = false,
  className = "",
}: AllianceButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2";

  const variants = {
    gold: `
      bg-gradient-to-r from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
      text-black
      shadow-[0_0_20px_rgba(255,223,148,0.35)]
      hover:shadow-[0_0_28px_rgba(255,223,148,0.55)]
    `,
    secondary:
      "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger:
      "bg-red-500/80 text-white hover:bg-red-500 shadow-[0_0_15px_#ff000055]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading && (
        <div className="h-4 w-4 border-2 border-black/40 border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

import Link from "next/link";

interface AllianceButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "secondary" | "danger";
  className?: string;
}

export function AllianceButtonLink({
  href,
  children,
  variant = "gold",
  className = "",
}: AllianceButtonLinkProps) {
  const baseStyles =
    "px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2";

  const variants = {
    gold: `
      bg-gradient-to-r from-[#fff3c4] via-[#e4c46d] to-[#b88a2a]
      text-black
      shadow-[0_0_20px_rgba(255,223,148,0.35)]
      hover:shadow-[0_0_28px_rgba(255,223,148,0.55)]
    `,
    secondary:
      "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger:
      "bg-red-500/80 text-white hover:bg-red-500 shadow-[0_0_15px_#ff000055]",
  };

  return (
    <Link
      href={href}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
