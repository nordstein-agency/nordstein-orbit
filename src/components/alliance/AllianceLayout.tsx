import AllianceParticles from "./AllianceParticles";
import AllianceRings from "./AllianceRings";
import AllianceAurora from "./AllianceAurora";
import AllianceBeams from "./AllianceBeams";

export default function AllianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#120b10] to-[#0c0709] text-white px-6 py-12">

      {/* Hintergrund Animationen */}
      <AllianceParticles />
      <AllianceRings />
      <AllianceAurora />
      <AllianceBeams />

      {/* Inhalt */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-8 mt-10">
        {children}
      </div>
    </div>
  );
}
