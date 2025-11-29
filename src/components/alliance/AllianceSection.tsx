export default function AllianceSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="
      bg-[#1f1620]/60 
      border border-[#2c1d2b] 
      rounded-2xl 
      p-8 shadow-xl 
      space-y-6 
      backdrop-blur-xl
    ">
      {children}
    </section>
  );
}
