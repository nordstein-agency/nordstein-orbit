

export default function DashboardLoading() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      
      <div
        className="
          relative w-24 h-24 
          animate-[orbit-spin_6s_linear_infinite] 
          flex items-center justify-center
        "
      >
        <div className="absolute inset-0 rounded-full blur-xl bg-[#b244ff]/30" />

        <img
          src="/orbit.png"
          alt="Orbit Logo"
          className="
            w-16 h-16 
            animate-[orbit-float_3s_ease-in-out_infinite]
            drop-shadow-[0_0_15px_#b244ff]
          "
        />
      </div>

      
    </div>
  );
}
