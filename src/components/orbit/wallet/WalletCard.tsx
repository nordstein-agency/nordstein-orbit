"use client";

export default function WalletCard({ credits }: { credits: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-lg">
      <p className="text-white/60 text-sm">Guthaben</p>
      <p className="text-white text-4xl font-bold mt-1">{credits} Credits</p>
    </div>
  );
}
