"use client";

interface OrbitButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function OrbitButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: OrbitButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#d8a5d0] to-[#a75692] text-black shadow-[0_0_20px_#a7569244] hover:shadow-[0_0_25px_#a7569288]",
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

interface OrbitButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export function OrbitButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: OrbitButtonLinkProps) {
  const baseStyles =
    "px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#d8a5d0] to-[#a75692] text-black shadow-[0_0_20px_#a7569244] hover:shadow-[0_0_25px_#a7569288]",
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
