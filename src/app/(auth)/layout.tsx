// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-brand-light">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-md">
        {/* Logo-Bereich */}
        <div className="mb-8 text-center">
          {/* Hier später dein echtes Logo (SVG/PNG) einbauen */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/40 mb-3">
            <span className="text-xl font-bold text-brand-accent">N</span>
          </div>
          <h1 className="text-xl font-semibold tracking-wide">
            Nordstein Orbit
          </h1>
          <p className="text-sm text-gray-300/80">
            Internes Portal für Nordstein One
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
