"use client";

export default function OrbitLoaderCore({
  size = 80,
  label,
}: {
  size?: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Spinner Ring */}
        <div
          className="absolute rounded-full border-4 border-white/10 border-t-[#B244FF] animate-spin"
          style={{ width: size, height: size }}
        />

        {/* Center Image */}
        <img
          src="/loading.png"
          alt="Loading"
          className="w-[70%] opacity-90"
        />
      </div>

      {label && (
        <p className="mt-6 text-sm text-white/70 text-center">
          {label}
        </p>
      )}
    </div>
  );
}
