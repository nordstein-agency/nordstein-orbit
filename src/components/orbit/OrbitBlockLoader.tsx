"use client";

import OrbitLoaderCore from "./OrbitLoaderCore";

export default function OrbitBlockLoader({
  label,
}: {
  label?: string;
}) {
  return (
    <div
      className="
        absolute inset-0 z-20
        flex items-center justify-center
        bg-black/50 backdrop-blur-md
        rounded-2xl
      "
    >
      <OrbitLoaderCore size={56} label={label} />
    </div>
  );
}
