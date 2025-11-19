interface ProgressBarProps {
  progress: number; // 0–100
  height?: string; // "h-2", "h-1", etc.
}

export default function ProgressBar({ progress, height = "h-2" }: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${height} bg-white/10 rounded-full overflow-hidden`}>
      <div
        className="h-full bg-gradient-to-r from-[#d8a5d0] to-[#a75692] rounded-full transition-all duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
